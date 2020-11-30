if(process.env.NODE_ENV==='development'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const cors = require("cors");
const pool = require('./db');
const { json } = require('express');


console.log(`entorno de desarrollo->${process.env.NODE_ENV}`);

app.use(cors());

//(middleware)
app.use(express.json());


//build routes with PostgreSQL queries
app.listen(process.env.PORT , () => {
    console.log(`listening ${process.env.PORT}`);
});

//routes
app.get('/testeo', async (req, res) => {
 
    try {
        var query = 'SELECT * FROM public.nettrade ORDER BY row_id ASC LIMIT 2';
        const response = await pool.query(query);
        res.status(200).json(response.rows)
     
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/net:combinations', async (req, res) => {
    try {

        const { product, iteration, scenathon_id } = JSON.parse(req.params.combinations).select;
        var query = 'SELECT "name",   "Year", ROUND("Import_quantity"::numeric,2) as "Import_quantity", ROUND("Export_quantity"::numeric,2) as "Export_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3  ORDER BY "name","Year" ASC  ';
        const response = await pool.query(query, [product, iteration, scenathon_id]);
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/protected:combinations', async (req, res) => {
    try {
        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = "SELECT \"Year\", ROUND(SUM(\"ProtectedAreasForest\")::numeric,2) as \"ProtectedAreasForest\", ROUND(SUM(\"ProtectedAreasOther\")::numeric,2) as \"ProtectedAreasOther\", ROUND(SUM(\"ProtectedAreasOtherNat\")::numeric,2) as \"ProtectedAreasOtherNat\" FROM \"resultsScen2020\" WHERE \"iteration\"=$1 GROUP BY \"Year\" ORDER BY \"Year\"";
                break;
            case "countries":
                var query = "SELECT \"Year\", ROUND(SUM(\"ProtectedAreasForest\")::numeric,2) as \"ProtectedAreasForest\", ROUND(SUM(\"ProtectedAreasOther\")::numeric,2) as \"ProtectedAreasOther\", ROUND(SUM(\"ProtectedAreasOtherNat\")::numeric,2) as \"ProtectedAreasOtherNat\" FROM \"resultsScen2020\" WHERE \"iteration\"=$1 AND \"Country\" NOT LIKE '%$_%' ESCAPE '$'  GROUP BY \"Year\" ORDER BY \"Year\"";
                break;
            case "regions":
                var query = "SELECT \"Year\", ROUND(SUM(\"ProtectedAreasForest\")::numeric,2) as \"ProtectedAreasForest\", ROUND(SUM(\"ProtectedAreasOther\")::numeric,2) as \"ProtectedAreasOther\", ROUND(SUM(\"ProtectedAreasOtherNat\")::numeric,2) as \"ProtectedAreasOtherNat\" FROM \"resultsScen2020\" WHERE \"iteration\"=$1 AND \"Country\" LIKE '%$_%' ESCAPE '$'  GROUP BY \"Year\" ORDER BY \"Year\"";
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration]);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});


app.get('/target5:combinations', async (req, res) => {
    try {
        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Country", ROUND((avg("kcal_feas"))::numeric,2) AS kcal_feasible, ROUND(avg("kcal_mder")::numeric,2) AS target_mder FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = 2030 GROUP BY "Country" ORDER BY "Country";';
                break;
            case "countries":
                var query = 'SELECT "Country", ROUND((avg("kcal_feas"))::numeric,2) AS kcal_feasible, ROUND(avg("kcal_mder")::numeric,2) AS target_mder FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = 2030 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ORDER BY "Country";';
                break;
            case "regions":
                var query = 'SELECT "Country", ROUND((avg("kcal_feas"))::numeric,2) AS kcal_feasible, ROUND(avg("kcal_mder")::numeric,2) AS target_mder FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = 2030 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ORDER BY "Country";';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
       
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/foodenergy2:combinations', async (req, res) => {
    try {
        const { Iteration, Year } = JSON.parse(req.params.combinations).select;
        var query = 'Select "Country",ROUND(avg("prot_feas")::numeric,2) as "Protein_feasible",ROUND(avg("fat_feas")::numeric,2) as "Fat_feasible" from "resultsScen2020" WHERE "iteration"=$1 AND "Year"=$2 GROUP BY "Country"';
        const response = await pool.query(query, [Iteration, Year]);
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/foodenergy1:combinations', async (req, res) => {
    try {
        const { Iteration, scenathon_id, Year } = JSON.parse(req.params.combinations).select;
        var query = 'SELECT "Country", ROUND(avg("kcal_feas")::numeric,2) AS "Kcal_feasible", ROUND(avg("kcal_mder")::numeric,2) AS "Target_MDER" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = $3 GROUP BY "Country" ORDER BY "Country"';
        const response = await pool.query(query, [Iteration, scenathon_id, Year]);
        res.status(200).json(response.rows);
       
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/landcover:combinations', async (req, res) => {
    try {
        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year",ROUND(sum("CalcPasture")::numeric,2) as "CalcPasture",ROUND(sum("CalcCropland")::numeric,2) as "CalcCropland",ROUND(sum("CalcForest")::numeric,2) as "CalcForest",ROUND(sum("CalcNewForest")::numeric,2) as "CalcNewForest" ,ROUND(sum("CalcOtherLand")::numeric,2) as "CalcOtherLand",sum("CalcUrban") as "CalcUrban" from "resultsScen2020" WHERE "iteration"=$1 GROUP BY "Year" order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year",ROUND(sum("CalcPasture")::numeric,2) as "CalcPasture",ROUND(sum("CalcCropland")::numeric,2) as "CalcCropland",ROUND(sum("CalcForest")::numeric,2) as "CalcForest",ROUND(sum("CalcNewForest")::numeric,2) as "CalcNewForest" ,ROUND(sum("CalcOtherLand")::numeric,2) as "CalcOtherLand",sum("CalcUrban") as "CalcUrban" from "resultsScen2020" WHERE "iteration"=$1 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year",ROUND(sum("CalcPasture")::numeric,2) as "CalcPasture",ROUND(sum("CalcCropland")::numeric,2) as "CalcCropland",ROUND(sum("CalcForest")::numeric,2) as "CalcForest",ROUND(sum("CalcNewForest")::numeric,2) as "CalcNewForest" ,ROUND(sum("CalcOtherLand")::numeric,2) as "CalcOtherLand",sum("CalcUrban") as "CalcUrban" from "resultsScen2020" WHERE "iteration"=$1 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" order by "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration]);
        res.status(200).json(response.rows);
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/biodiversity:combinations', async (req, res) => {

    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year","Country", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_land",ROUND((((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / 12376354)*100)::numeric,2) AS "Protected_land" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_land",ROUND((((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / 12376354)*100)::numeric,2) AS "Protected_land" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_land",ROUND((((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / 12376354)*100)::numeric,2) AS "Protected_land" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});



app.get('/freshwater1:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});
app.get('/freshwater2:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year","Country",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2  GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
      
        res.status(200).json(response.rows);
         



    } catch (err) {
        console.error(err.message);
    }
});

app.get('/forestTwo:combinations', async (req, res) => {
   
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year","Country",ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 GROUP BY "Country","Year" Order by "Country","Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country",ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country","Year" Order by "Country","Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country",ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country","Year" Order by "Country","Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows);
     
    } catch (err) {
        console.error(err.message);
    }
});
app.get('/gas2:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year","Country",(ROUND(sum("CalcAllAgriCO2e")::numeric,2)/1000) as "AgriCO2e",(ROUND(avg("CalcAllLandCO2e")::numeric,2)/1000) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country",(ROUND(sum("CalcAllAgriCO2e")::numeric,2)/1000) as "AgriCO2e",(ROUND(avg("CalcAllLandCO2e")::numeric,2)/1000) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country",(ROUND(sum("CalcAllAgriCO2e")::numeric,2)/1000) as "AgriCO2e",(ROUND(avg("CalcAllLandCO2e")::numeric,2)/1000) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});
app.get('/gas1:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e")))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(AVG("fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcDeforCO2")/100)::numeric,2) AS "deforestation", ROUND((AVG("CalcOtherLUCCO2")/100)::numeric,2) AS "Other_LUC", ROUND((AVG("CalcSequestCO2")/100)::numeric,2) AS "sequestration", ROUND((AVG("CalcPeatCO2")/100)::numeric,2) AS "peat", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 GROUP BY ("Year") ORDER BY ("Year")';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e")))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(AVG("fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcDeforCO2")/100)::numeric,2) AS "deforestation", ROUND((AVG("CalcOtherLUCCO2")/100)::numeric,2) AS "Other_LUC", ROUND((AVG("CalcSequestCO2")/100)::numeric,2) AS "sequestration", ROUND((AVG("CalcPeatCO2")/100)::numeric,2) AS "peat", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY ("Year") ORDER BY ("Year")';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e")))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(AVG("fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcDeforCO2")/100)::numeric,2) AS "deforestation", ROUND((AVG("CalcOtherLUCCO2")/100)::numeric,2) AS "Other_LUC", ROUND((AVG("CalcSequestCO2")/100)::numeric,2) AS "sequestration", ROUND((AVG("CalcPeatCO2")/100)::numeric,2) AS "peat", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2  AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY ("Year") ORDER BY ("Year")';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});
app.get('/forestOne:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year", ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange", ROUND(sum(CASE WHEN "NetForestChange" > 0 THEN "NetForestChange" ELSE 0 END)::numeric,2) as "Aforestation", ROUND(sum(CASE WHEN "NetForestChange" < 0 THEN "NetForestChange" ELSE 0 END)::numeric,2) as "ForestLoss", ROUND(sum("gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(AVG("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange", ROUND(sum(CASE WHEN "NetForestChange" > 0 THEN "NetForestChange" ELSE 0 END)::numeric,2) as "Aforestation", ROUND(sum(CASE WHEN "NetForestChange" < 0 THEN "NetForestChange" ELSE 0 END)::numeric,2) as "ForestLoss", ROUND(sum("gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(AVG("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange", ROUND(sum(CASE WHEN "NetForestChange" > 0 THEN "NetForestChange" ELSE 0 END)::numeric,2) as "Aforestation", ROUND(sum(CASE WHEN "NetForestChange" < 0 THEN "NetForestChange" ELSE 0 END)::numeric,2) as "ForestLoss", ROUND(sum("gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(AVG("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY "Year" Order by "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});


app.get('/tradereport:combinations', async (req, res) => {
    try {

        const { Product, iteration, scenathon_id, column, Country } = JSON.parse(req.params.combinations).select;
        if (column === "Import_quantity") {
            if(Country === "countries"){
                var query = 'SELECT "name",   "Year", ROUND("Import_quantity"::numeric,2) as "Import_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3 ORDER BY "name","Year" ASC  ';
                var response = await pool.query(query, [Product, iteration, scenathon_id]);
            }else{
                var query = 'SELECT "name",   "Year", ROUND("Import_quantity"::numeric,2) as "Import_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3  AND "name"=$4 ORDER BY "name","Year" ASC  ';
                var response = await pool.query(query, [Product, iteration, scenathon_id, Country]);
            }
        } else {
            if(Country === "countries"){
                var query = 'SELECT "name", "Year", ROUND("Export_quantity"::numeric,2) as "Export_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3ORDER BY "name","Year" ASC ';
                var response = await pool.query(query, [Product, iteration, scenathon_id]);
            }else{
                var query = 'SELECT "name", "Year", ROUND("Export_quantity"::numeric,2) as "Export_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3 AND "name"=$4  ORDER BY "name","Year" ASC ';
                var response = await pool.query(query, [Product, iteration, scenathon_id, Country]);
            }
        }
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/globaltest', async (req, res) => {
    try {

        //const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch ("group") {
            case "group":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [4, 6]);
       
      
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/globaltest1', async (req, res) => {
    try {

        //const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch ("group") {
            case "group":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / SUM("resultsScen2020"."TotalLand"))::numeric,2) AS "Protected_Land", ROUND(AVG("protected_land_target"/100)::numeric,2) as "Protected_land_target", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_Land", ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversity" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2020 GROUP BY "Year" ORDER BY "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / SUM("resultsScen2020"."TotalLand"))::numeric,2) AS "Protected_Land", ROUND(AVG("protected_land_target"/100)::numeric,2) as "Protected_land_target", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_Land", ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversity" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2020 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / SUM("resultsScen2020"."TotalLand"))::numeric,2) AS "Protected_Land", ROUND(AVG("protected_land_target"/100)::numeric,2) as "Protected_land_target", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_Land", ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversity" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2020 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [4, 6]);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});

app.get('/targets123:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / 12376354)::numeric,2) AS "Protected_Land", ROUND(AVG("protected_land_target"/100)::numeric,2) as "Protected_land_target", ROUND(((SUM("resultsScen2020"."CalcBiodivLnd" * "resultsScen2020"."TotalLand")) / 12376354)::numeric,2) AS "Biodiversity_Land", ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversity" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2020 GROUP BY "Year" ORDER BY "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / 12376354)::numeric,2) AS "Protected_Land", ROUND(AVG("protected_land_target"/100)::numeric,2) as "Protected_land_target", ROUND((SUM("resultsScen2020"."CalcBiodivLnd" * "resultsScen2020"."TotalLand") / 12376354)::numeric,2) AS "Biodiversity_Land", ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversity" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2020 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / 12376354)::numeric,2) AS "Protected_Land", ROUND(AVG("protected_land_target"/100)::numeric,2) as "Protected_land_target",ROUND(((SUM("resultsScen2020"."CalcBiodivLnd"*  "resultsScen2020"."TotalLand")) / 12376354)::numeric,2) AS "Biodiversity_Land", ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversity" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2020 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});

app.get('/targets4and6:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [Iteration, scenathon_id]);
       
      
        res.status(200).json(response.rows)
         
    } catch (err) {
        console.error(err.message);
    }
});