const expressasyncHandler = require('express-async-handler');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const DistributorModel = require('../models/DistributorModel');
const CustomerDashboardModel = require('../models/CustomerDashboardModel');
const NewCustomerModel = require('../models/NewCustomerModel');
const mongoose = require('mongoose');
const saveDistributorData = expressasyncHandler(async (req, res, next) => {
    try {
        // Debug what we received
        console.log('Files structure:', req.files ? Object.keys(req.files) : 'No files');
        
        // Check if files exist and have the expected structure
        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.status(400).json({ 
                message: 'No file uploaded',
                receivedFields: req.body ? Object.keys(req.body) : []
            });
        }
        
        // Access the file buffer correctly
        const fileBuffer = req.files.file[0].buffer;



        // /////////// Excel To JSON  Processing /////////// 
        
        // Process the Excel file with optimized options
        const workbook = xlsx.read(fileBuffer, { 
            type: 'buffer',
            cellFormula: false,  // Disable formula parsing
            cellHTML: false,     // Disable HTML parsing
            cellStyles: false,   // Disable style parsing
            cellDates: false,    // Don't convert dates
            cellNF: false,       // Don't parse number formats
            cellText: false,     // Don't parse rich text
            dense: true          // Use dense output format for smaller memory footprint
        });
        
        const sheetName = workbook.SheetNames[0];
        
        // Use sheet_to_json with optimized options - using first row as headers
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
            raw: true,           // Use raw values (no type conversion)
            defval: null,        // Use null for empty cells
            blankrows: false     // Skip blank rows
        });
        
        // Process data in batches to avoid memory issues
        const batchSize = 1000;
        const batches = [];
        
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        

        // ////////////////////////////////////////////////////////////




        // /////////// MongoDB Processing /////////// 
        
        // Save data to MongoDB in batches
        for (const batch of batches) {
            await DistributorModel.insertMany(batch, { ordered: false });
        }

        // ////////////////////////////////////////////////////////////



        return res.status(200).json({
            success: true,
            message: 'Excel file processed successfully',
            rowCount: data.length,
            sampleData: data.slice(0, 3)
        });
    } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process Excel file',
            error: error.message
        });
    }
});

// Get distributors grouped by DIST_CD with sum of GROSS_AMT
const getDistributorSummary = expressasyncHandler(async (req, res) => {
    try {
        // MongoDB aggregation to group by DIST_CD and sum GROSS_AMT
        const distributorSummary = await DistributorModel.aggregate([
            {
                $match: {
                    DIST_CD: { $exists: true },
                    GROSS_AMT: { $exists: true }
                }
            },
            {
                $addFields: {
                    // Convert GROSS_AMT from string to number for aggregation
                    numericGrossAmt: { $toDouble: "$GROSS_AMT" }
                }
            },
            {
                $group: {
                    _id: "$DIST_CD",
                    distributorName: { $first: "$DIST_NAME" },
                    totalGrossAmount: { $sum: "$numericGrossAmt" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalGrossAmount: -1 }  // Sort by total amount in descending order
            },
            {
                $project: {
                    _id: 0,
                    distributorId: "$_id",
                    distributorName: 1,
                    totalGrossAmount: { $round: ["$totalGrossAmount", 2] },
                    count: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: distributorSummary.length,
            data: distributorSummary
        });
    } catch (error) {
        console.error('Error getting distributor summary:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get distributor summary',
            error: error.message
        });
    }
});


const getDistributorData = expressasyncHandler(async (req, res) => { 

    try 
    
    {

        const PLATINUM_ENTRY_THRESHOLD = 30000;
        const GOLD_ENTRY_THRESHOLD = 10000;
        const SILVER_ENTRY_THRESHOLD = 2500;



        const basePipeline = [
            {
                $match: {
                    CUST_CD: { $exists: true },
                    GROSS_AMT: { $exists: true }
                }
            },

            // {
            //     $addFields: {
            //         numericGrossAmt: { $toDouble: "$GROSS_AMT" }
            //     }
            // },

            // group customers and sum their gross amount
            {
                $group: {
                    _id: "$CUST_CD",
                    customerName: { $first: "$CUST_NAME" },
                    totalGrossAmount: { $sum: "$GROSS_AMT" },
                    DistributorCode : { $first: "$DIST_CD"},
                    DistributorName : { $first: "$DIST_NAME"},
                    Region : { $first: "$REGION"},
                }
            },

            // sort by totalGrossAmount in descending order
            {
                $sort: { totalGrossAmount: -1 }
            },

            // Format the output
            {
                $project: {
                    _id: 0,
                    customerCode: "$_id",
                    customerName: 1,
                    DistributorCode : 1,
                    DistributorName : 1,
                    Region : 1,
                    totalGrossAmount: { $round: ["$totalGrossAmount", 2] }
                }
            }
        ];


        // Get platinum customers (> 2 million)
        const PlatinumCustomers = await DistributorModel.aggregate([
            ...basePipeline.slice(0, 2),
            {
                $match: {
                    totalGrossAmount: { $gt: 2000000 }
                }
            },
            ...basePipeline.slice(2)
        ]);


        // Get gold customers (1.5 million to 2 million)
        const GoldCustomers = await DistributorModel.aggregate([
            ...basePipeline.slice(0, 2),
            {
                $match: {
                    totalGrossAmount: { $gt: 1500000, $lte: 2000000 }
                }
            },
            ...basePipeline.slice(2)
        ]);


        // Get silver customers (> 1 million and <= 1.5 million)
        const SilverCustomers = await DistributorModel.aggregate([
            ...basePipeline.slice(0, 2),
            {
                $match: {
                    totalGrossAmount: { $gt: 1000000, $lte: 1500000 }
                }
            },
            ...basePipeline.slice(2)
        ]);


        // Entries Calculation 

        const PlatinumWithEntries = PlatinumCustomers.map((customer) => {
             
            const platinumEntries = Math.floor(customer.totalGrossAmount / PLATINUM_ENTRY_THRESHOLD);
            const remainingAmountAfterPlatinum = customer.totalGrossAmount % PLATINUM_ENTRY_THRESHOLD;

            const goldEntries = Math.floor(remainingAmountAfterPlatinum / GOLD_ENTRY_THRESHOLD);
            const remainingAmountAfterGold = remainingAmountAfterPlatinum % GOLD_ENTRY_THRESHOLD;

            const silverEntries = Math.floor(remainingAmountAfterGold / SILVER_ENTRY_THRESHOLD);

            return {
                ...customer,
                entries: {
                    platinumEntries,
                    goldEntries,
                    silverEntries
                }
            }
        } );

        const GoldWithEntries = GoldCustomers.map((customer) => {

            const goldEntries = Math.floor(customer.totalGrossAmount / GOLD_ENTRY_THRESHOLD);
            const remainingAmountAfterGold = customer.totalGrossAmount % GOLD_ENTRY_THRESHOLD;

            const silverEntries = Math.floor(remainingAmountAfterGold / SILVER_ENTRY_THRESHOLD);

            return {
                ...customer,
                entries: {
                    platinumEntries: 0,
                    goldEntries,
                    silverEntries
                }
            }
        } );


        const SilverWithEntries = SilverCustomers.map((customer) => {

            const silverEntries = Math.floor(customer.totalGrossAmount / SILVER_ENTRY_THRESHOLD);

            return {
                ...customer,
                entries: {
                    platinumEntries: 0,
                    goldEntries: 0,
                    silverEntries
                }
            }
        } );

      const CustomerDashboardData = new CustomerDashboardModel({
        Platinum:{
            count: PlatinumCustomers.length,
            data: PlatinumWithEntries
        },
        Gold:{
            count: GoldCustomers.length,
            data: GoldWithEntries
        },
        Silver:{
            count: SilverCustomers.length,
            data: SilverWithEntries
        },
        lastUpdated: new Date()
      });

      // Fetch geo data from CustomerGeoLocation collection
      const db = mongoose.connection.db;
      const geoCollection = db.collection('CustomerGeoLocation');
      
      // Get all geo data and create a map for quick lookup
      const geoData = await geoCollection.find({}).toArray();
      
      // Create a map of distributor code to geo data for faster lookups
      const geoDataMap = {};
      geoData.forEach(item => {
          // Convert to string to ensure consistent comparison
          console.log(item['Status']);

          if(item['Status'] !== "Exclude"){
          const distCode = String(item['Distributor Code']);
          geoDataMap[distCode] = {
              ZONE: item.ZoneDesc,
              AREA: item.Area,
              REGION: item.Region
          };
          }
      });

      console.log(geoDataMap , "geoDataMap")
      
      console.log(`Loaded ${Object.keys(geoDataMap).length} geo data entries`);
      
      // Update Platinum customers with geo data
      CustomerDashboardData.Platinum.data =

      CustomerDashboardData.Platinum.data.filter(customer => {
        return geoDataMap[String(customer.DistributorCode)] ;
      }).map(customer => {
          const geoInfo = geoDataMap[String(customer.DistributorCode)];
          if (geoInfo) {
              customer.ZONE = geoInfo.ZONE;
              customer.AREA = geoInfo.AREA;
              // Only update REGION if it's not already set or if you want to override it
              if (!customer.Region) {
                  customer.Region = geoInfo.REGION;
              }
              return customer;
          }
          return;
      });
      
      // Update Gold customers with geo data
      CustomerDashboardData.Gold.data = CustomerDashboardData.Gold.data.filter(customer => {
        return geoDataMap[String(customer.DistributorCode)] ;
      }).map(customer => {
          const geoInfo = geoDataMap[String(customer.DistributorCode)];
          if (geoInfo) {
              customer.ZONE = geoInfo.ZONE;
              customer.AREA = geoInfo.AREA;
              if (!customer.Region) {
                  customer.Region = geoInfo.REGION;
              }
              return customer;
          }
          return;
      });
      
      // Update Silver customers with geo data
      CustomerDashboardData.Silver.data = CustomerDashboardData.Silver.data.filter(customer => {
        return geoDataMap[String(customer.DistributorCode)] ;
      }).map(customer => {
          const geoInfo = geoDataMap[String(customer.DistributorCode)];
          if (geoInfo) {
              customer.ZONE = geoInfo.ZONE;
              customer.AREA = geoInfo.AREA;
              if (!customer.Region) {
                  customer.Region = geoInfo.REGION;
              }
              return customer;
          }
          return;
      });

      await CustomerDashboardData.save();

       return res.status(200).json({
            success: true,
            message: "Dashboard Data Generated Successfully",
        })
        
    } 
    
    
    catch (error) {
        res.status(500).json({ message: error.message });
    }




    // try {
    //     const data = await DistributorModel.find().limit(100);
    //     res.status(200).json(data);
    // } catch (error) {
    //     res.status(500).json({ message: error.message });
    // }
});





// Getting New Sorted Customers Data

const getAllCustomerData = expressasyncHandler(async (req, res) => {
     try {
        // Disable caching for this endpoint
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        const hasPageParam = req.query.page !== undefined;
        const hasLimitParam = req.query.limit !== undefined;
        const isPaginated = hasPageParam || hasLimitParam;

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(5000, parseInt(req.query.limit, 10) || 1000));
        const skip = (page - 1) * limit;
        const search = (req.query.search || '').trim();
        const distCd = req.query.dist_cd ? parseInt(req.query.dist_cd, 10) : null;

        const filter = {};
        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ "Customer Code": regex }, { "Customer Name": regex }];
        }
        if (!Number.isNaN(distCd) && distCd !== null) {
            filter.dist_cd = distCd;
        }

        let data, total;
        if (isPaginated) {
            [data, total] = await Promise.all([
                NewCustomerModel.find(filter).skip(skip).limit(limit),
                NewCustomerModel.countDocuments(filter)
            ]);
        } else {
            data = await NewCustomerModel.find(filter);
            total = data.length;
        }

        if (isPaginated) {
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return res.status(200).json({
                success: true,
                message: "Dashboard Data Generated Successfully",
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Dashboard Data Generated Successfully",
                data,
                pagination: {
                    total,
                    limit: null,
                    page: null
                }
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = { saveDistributorData, getDistributorSummary , getDistributorData , getAllCustomerData };
