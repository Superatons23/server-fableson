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

//--------------------------------------------------------SCENATHON 2020----------------------------------------------//
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
                var query = 'SELECT "Year","Country",(ROUND(sum("CalcAllAgriCO2e")::numeric,2)/1000) as "AgriCO2e",(ROUND(avg("CalcAllLandCO2e")::numeric,2)/1000) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Year" > 2000  GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country",(ROUND(sum("CalcAllAgriCO2e")::numeric,2)/1000) as "AgriCO2e",(ROUND(avg("CalcAllLandCO2e")::numeric,2)/1000) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Year" > 2000 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country",(ROUND(sum("CalcAllAgriCO2e")::numeric,2)/1000) as "AgriCO2e",(ROUND(avg("CalcAllLandCO2e")::numeric,2)/1000) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Year" > 2000  AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
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
                var query = 'SELECT "Year", ROUND((SUM("GHGbiofuels")/1000)::numeric,2) as "Biofuels", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e"))+SUM("GHGbiofuels"))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((SUM("CalcDeforCO2")/1000)::numeric,2) AS "deforestation", ROUND((SUM("CalcOtherLUCCO2")/1000)::numeric,2) AS "Other_LUC", ROUND((SUM("CalcSequestCO2")/1000)::numeric,2) AS "sequestration", ROUND((SUM("CalcPeatCO2")/1000)::numeric,2) AS "peat", ROUND((SUM("CalcAllLandCO2e")/1000)::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" >2000 GROUP BY ("Year") ORDER BY ("Year")';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND((SUM("GHGbiofuels")/1000)::numeric,2) as "Biofuels", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e"))+SUM("GHGbiofuels"))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((SUM("CalcDeforCO2")/1000)::numeric,2) AS "deforestation", ROUND((SUM("CalcOtherLUCCO2")/1000)::numeric,2) AS "Other_LUC", ROUND((SUM("CalcSequestCO2")/1000)::numeric,2) AS "sequestration", ROUND((SUM("CalcPeatCO2")/1000)::numeric,2) AS "peat", ROUND((SUM("CalcAllLandCO2e")/1000)::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" >2000 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY ("Year") ORDER BY ("Year")';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND((SUM("GHGbiofuels")/1000)::numeric,2) as "Biofuels", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e"))+SUM("GHGbiofuels"))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((SUM("CalcDeforCO2")/1000)::numeric,2) AS "deforestation", ROUND((SUM("CalcOtherLUCCO2")/1000)::numeric,2) AS "Other_LUC", ROUND((SUM("CalcSequestCO2")/1000)::numeric,2) AS "sequestration", ROUND((SUM("CalcPeatCO2")/1000)::numeric,2) AS "peat", ROUND((SUM("CalcAllLandCO2e")/1000)::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" >2000  AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY ("Year") ORDER BY ("Year")';
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
                var query = 'SELECT "Year", ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange", ROUND(sum("NewForestChange")::numeric,2) as "Aforestation", ROUND(sum("ForestChange")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(AVG("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange", ROUND(sum("NewForestChange")::numeric,2) as "Aforestation", ROUND(sum("ForestChange")::numeric,2) as "ForestLoss", ROUND(sum("gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(AVG("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND(sum("NetForestChange")::numeric,2) as "NetForestChange", ROUND(sum("NewForestChange")::numeric,2) as "Aforestation", ROUND(sum("ForestChange")::numeric,2) as "ForestLoss", ROUND(sum("gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(AVG("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY "Year" Order by "Year"';
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
                var query = 'SELECT "Year",ROUND((SUM("GHGbiofuels")/1000)::numeric,2) as "Biofuels", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e"))+SUM("GHGbiofuels"))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(AVG("fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcDeforCO2")/100)::numeric,2) AS "deforestation", ROUND((AVG("CalcOtherLUCCO2")/100)::numeric,2) AS "Other_LUC", ROUND((AVG("CalcSequestCO2")/100)::numeric,2) AS "sequestration", ROUND((AVG("CalcPeatCO2")/100)::numeric,2) AS "peat", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" >2000 GROUP BY ("Year") ORDER BY ("Year")';
                break;
            case "countries":
                var query = 'SELECT "Year",ROUND((SUM("GHGbiofuels")/1000)::numeric,2) as "Biofuels", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e"))+SUM("GHGbiofuels"))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(AVG("fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcDeforCO2")/100)::numeric,2) AS "deforestation", ROUND((AVG("CalcOtherLUCCO2")/100)::numeric,2) AS "Other_LUC", ROUND((AVG("CalcSequestCO2")/100)::numeric,2) AS "sequestration", ROUND((AVG("CalcPeatCO2")/100)::numeric,2) AS "peat", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" >2000 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\'  GROUP BY ("Year") ORDER BY ("Year")';
                break;
            case "regions":
                var query = 'SELECT "Year",ROUND((SUM("GHGbiofuels")/1000)::numeric,2) as "Biofuels", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(((SUM("CalcLiveAllCO2e")+(SUM("CalcCropAllCO2e"))+SUM("GHGbiofuels"))/1000)::numeric,2) AS "Total_GHG_agric", ROUND(AVG("fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((AVG("CalcDeforCO2")/100)::numeric,2) AS "deforestation", ROUND((AVG("CalcOtherLUCCO2")/100)::numeric,2) AS "Other_LUC", ROUND((AVG("CalcSequestCO2")/100)::numeric,2) AS "sequestration", ROUND((AVG("CalcPeatCO2")/100)::numeric,2) AS "peat", ROUND((AVG("CalcAllLandCO2e")/100)::numeric,2) AS "total_GHG_land", ROUND(AVG("fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" >2000  AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY ("Year") ORDER BY ("Year")';
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
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((SUM("CalcAllLandCO2e")/1000)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((SUM("CalcAllLandCO2e")/1000)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND((SUM("CalcLiveCH4")/1000)::numeric,2) AS "Livestock_CH4", ROUND((SUM("CalcLiveN2O")/1000)::numeric,2) AS "Livestock_N20", ROUND((SUM("CalcCropN2O")/1000)::numeric,2) AS "Crop_N20", ROUND((SUM("CalcCropCH4")/1000)::numeric,2) AS "Crop_CH4", ROUND((SUM("CalcCropCO2")/1000)::numeric,2) AS "Crop_CO2", ROUND(AVG("ghg_agri_target")::numeric,2) AS "ghg_agri_target", ROUND((SUM("CalcAllLandCO2e")/1000)::numeric,2) AS "total_GHG_land", ROUND(AVG("ghg_lu_target")::numeric,2) AS "GHG_LU_target", ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater", ROUND(AVG("water_target")::numeric,2) as "water_target" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
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
app.get('/target1:combinations', async (req, res) => {
    try {

        const { Iteration, scenathon_id, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2025 GROUP BY "Year" ORDER BY "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2025 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "NetForestChange", ROUND(SUM("forest_target")::numeric,2) as "Forest_target" FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" > 2025 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
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

//--------------------------------------------------------SCENATHON 2019----------------------------------------------//


app.get('/Page1_full:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year" as "Year", ROUND(SUM("netforest_change")::numeric,2) as "NetForestChange", ROUND(SUM("newforest_change")::numeric,2) as "Aforestation", ROUND(SUM("forest_change")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(SUM("biodivshareland")::numeric,2) as "Biodiversity_Land", ROUND((SUM("livestockch4"))::numeric,2) AS "Livestock_CH4", ROUND((SUM("livestockno2"))::numeric,2) AS "Livestock_N20", ROUND((SUM("cropsn2o"))::numeric,2) AS "Crop_N20", ROUND((SUM("cropsch4"))::numeric,2) AS "Crop_CH4", ROUND((SUM("cropsco2"))::numeric,2) AS "Crop_CO2", ROUND(SUM("totalghgagric")::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND((SUM("deforco2"))::numeric,2) AS "deforestation", ROUND((SUM("otherlucc"))::numeric,2) AS "Other_LUC", ROUND((SUM("sequestco2"))::numeric,2) AS "sequestration", ROUND(SUM("peatco2")::numeric,2) AS "peat", ROUND((sum("totalghglar"))::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND((avg("kcal_feas"))::numeric,2) AS kcal_feasible, ROUND((avg("kcal_targ"))::numeric,2) AS kcal_target, ROUND(avg("kcal_mder")::numeric,2) AS target_mder FROM public.indicators19 WHERE iteration=$1  GROUP BY "year" ORDER BY "year"';
                break;
            case "countries":
                var query = 'SELECT "year" as "Year", ROUND(SUM("netforest_change")::numeric,2) as "NetForestChange", ROUND(SUM("newforest_change")::numeric,2) as "Aforestation", ROUND(SUM("forest_change")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(SUM("biodivshareland")::numeric,2) as "Biodiversity_Land", ROUND((SUM("livestockch4"))::numeric,2) AS "Livestock_CH4", ROUND((SUM("livestockno2"))::numeric,2) AS "Livestock_N20", ROUND((SUM("cropsn2o"))::numeric,2) AS "Crop_N20", ROUND((SUM("cropsch4"))::numeric,2) AS "Crop_CH4", ROUND((SUM("cropsco2"))::numeric,2) AS "Crop_CO2", ROUND(SUM("totalghgagric")::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND((SUM("deforco2"))::numeric,2) AS "deforestation", ROUND((SUM("otherlucc"))::numeric,2) AS "Other_LUC", ROUND((SUM("sequestco2"))::numeric,2) AS "sequestration", ROUND(SUM("peatco2")::numeric,2) AS "peat", ROUND((sum("totalghglar"))::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND((avg("kcal_feas"))::numeric,2) AS kcal_feasible, ROUND((avg("kcal_targ"))::numeric,2) AS kcal_target, ROUND(avg("kcal_mder")::numeric,2) AS target_mder FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All FABLE countries\' GROUP BY "year" ORDER BY "year"';
                break;
            case "regions":
                var query = 'SELECT "year" as "Year", ROUND(SUM("netforest_change")::numeric,2) as "NetForestChange", ROUND(SUM("newforest_change")::numeric,2) as "Aforestation", ROUND(SUM("forest_change")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global", ROUND(SUM("biodivshareland")::numeric,2) as "Biodiversity_Land", ROUND((SUM("livestockch4"))::numeric,2) AS "Livestock_CH4", ROUND((SUM("livestockno2"))::numeric,2) AS "Livestock_N20", ROUND((SUM("cropsn2o"))::numeric,2) AS "Crop_N20", ROUND((SUM("cropsch4"))::numeric,2) AS "Crop_CH4", ROUND((SUM("cropsco2"))::numeric,2) AS "Crop_CO2", ROUND(SUM("totalghgagric")::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND((SUM("deforco2"))::numeric,2) AS "deforestation", ROUND((SUM("otherlucc"))::numeric,2) AS "Other_LUC", ROUND((SUM("sequestco2"))::numeric,2) AS "sequestration", ROUND(SUM("peatco2")::numeric,2) AS "peat", ROUND((sum("totalghglar"))::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu", ROUND((avg("kcal_feas"))::numeric,2) AS kcal_feasible, ROUND((avg("kcal_targ"))::numeric,2) AS kcal_target, ROUND(avg("kcal_mder")::numeric,2) AS target_mder FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All ROW regions\' GROUP BY "year" ORDER BY "year"';
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
app.get('/Page4_MultipleProducts:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType , products, countries } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "product" = ANY ($2) GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, products];
                break;
            case "countries":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "product" = ANY ($2) AND "country_id" NOT IN (30,24,21,25,26,23,22,27) GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, products];
                break;
            case "regions":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "product" = ANY ($2) AND "country_id" IN(30,24,21,25,26,23,22,27) GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, products];
                break;
            case "arrayCountry":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "country" = ANY ($2) AND "product" = ANY ($3) GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, countries, products];
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query,params);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});
app.get('/Page4_SingleProduct:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType , product, countries } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "product"= $2 GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, product];
                break;
            case "countries":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "product"= $2 AND "country_id" NOT IN (30,24,21,25,26,23,22,27) GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, product];
                break;
            case "regions":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "product"= $2 AND "country_id" IN(30,24,21,25,26,23,22,27) GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, product];
                break;
            case "arrayCountry":
                var query = 'SELECT "year", "product", SUM(("export_quantity"-"import_quantity")) AS "exports-imports" FROM "trade2" WHERE "iteration"=$1 AND "country" = ANY ($2) AND "product" = $3 GROUP BY "year","product" ORDER BY "product","year"';
                var params=[Iteration, countries, product];
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query,params);
        res.status(200).json(response.rows)
         


    } catch (err) {
        console.error(err.message);
    }
});

app.get('/Page1_NetForestCoverChange:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year" as "Year", ROUND(SUM("netforest_change")::numeric,2) as "NetForestChange", ROUND(SUM("newforest_change")::numeric,2) as "Aforestation", ROUND(SUM("forest_change")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global" FROM public.indicators19 WHERE iteration=$1 AND "year" > 2000 GROUP BY "year" ORDER BY "year"';
                break;
            case "countries":
                var query = 'SELECT "year" as "Year", ROUND(SUM("netforest_change")::numeric,2) as "NetForestChange", ROUND(SUM("newforest_change")::numeric,2) as "Aforestation", ROUND(SUM("forest_change")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global" FROM public.indicators19 WHERE iteration=$1 AND "year" > 2000   AND "group"= \'All FABLE countries\' GROUP BY "year" ORDER BY "year"';
                break;
            case "regions":
                var query = 'SELECT "year" as "Year", ROUND(SUM("netforest_change")::numeric,2) as "NetForestChange", ROUND(SUM("newforest_change")::numeric,2) as "Aforestation", ROUND(SUM("forest_change")::numeric,2) as "ForestLoss", ROUND(sum(DISTINCT "gfw_deforestation")::numeric,2) as "GFW_deforestation_global" FROM public.indicators19 WHERE iteration=$1 AND "year" > 2000   AND "group"= \'All ROW regions\' GROUP BY "year" ORDER BY "year"';
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
app.get('/Page1_Biodiversity:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year" as "Year", ROUND(SUM("biodivshareland")::numeric,2) as "Biodiversity_Land" FROM public.indicators19 WHERE iteration=$1  GROUP BY "year" ORDER BY "year"';
                break;
            case "countries":
                var query = 'SELECT "year" as "Year", ROUND(SUM("biodivshareland")::numeric,2) as "Biodiversity_Land" FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All FABLE countries\' GROUP BY "year" ORDER BY "year"';
                break;
            case "regions":
                var query = 'SELECT "year" as "Year", ROUND(SUM("biodivshareland")::numeric,2) as "Biodiversity_Land" FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All ROW regions\' GROUP BY "year" ORDER BY "year"';
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
app.get('/Page1_GreenhouseGas:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year" as "Year", ROUND((SUM("livestockch4"))::numeric,2) AS "Livestock_CH4", ROUND((SUM("livestockno2"))::numeric,2) AS "Livestock_N20", ROUND((SUM("cropsn2o"))::numeric,2) AS "Crop_N20", ROUND((SUM("cropsch4"))::numeric,2) AS "Crop_CH4", ROUND((SUM("cropsco2"))::numeric,2) AS "Crop_CO2", ROUND(SUM("totalghgagric")::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND((SUM("deforco2"))::numeric,2) AS "deforestation", ROUND((SUM("otherlucc"))::numeric,2) AS "Other_LUC", ROUND((SUM("sequestco2"))::numeric,2) AS "sequestration", ROUND(SUM("peatco2")::numeric,2) AS "peat", ROUND((SUM("totalghglar"))::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu" FROM public.indicators19 WHERE iteration=$1  GROUP BY "year" ORDER BY "year"';
                break;
            case "countries":
                var query = 'SELECT "year" as "Year", ROUND((SUM("livestockch4"))::numeric,2) AS "Livestock_CH4", ROUND((SUM("livestockno2"))::numeric,2) AS "Livestock_N20", ROUND((SUM("cropsn2o"))::numeric,2) AS "Crop_N20", ROUND((SUM("cropsch4"))::numeric,2) AS "Crop_CH4", ROUND((SUM("cropsco2"))::numeric,2) AS "Crop_CO2", ROUND(SUM("totalghgagric")::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND((SUM("deforco2"))::numeric,2) AS "deforestation", ROUND((SUM("otherlucc"))::numeric,2) AS "Other_LUC", ROUND((SUM("sequestco2"))::numeric,2) AS "sequestration", ROUND(SUM("peatco2")::numeric,2) AS "peat", ROUND((SUM("totalghglar"))::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu" FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All FABLE countries\' GROUP BY "year" ORDER BY "year"';
                break;
            case "regions":
                var query = 'SELECT "year" as "Year", ROUND((SUM("livestockch4"))::numeric,2) AS "Livestock_CH4", ROUND((SUM("livestockno2"))::numeric,2) AS "Livestock_N20", ROUND((SUM("cropsn2o"))::numeric,2) AS "Crop_N20", ROUND((SUM("cropsch4"))::numeric,2) AS "Crop_CH4", ROUND((SUM("cropsco2"))::numeric,2) AS "Crop_CO2", ROUND(SUM("totalghgagric")::numeric,2) AS "Total_GHG_agric", ROUND(SUM(DISTINCT"fao_ghgagric")::numeric,2) AS "FAO_GHGagric", ROUND((SUM("deforco2"))::numeric,2) AS "deforestation", ROUND((SUM("otherlucc"))::numeric,2) AS "Other_LUC", ROUND((SUM("sequestco2"))::numeric,2) AS "sequestration", ROUND(SUM("peatco2")::numeric,2) AS "peat", ROUND((SUM("totalghglar"))::numeric,2) AS "total_GHG_land", ROUND(SUM(DISTINCT"fao_ghg_lu")::numeric,2) AS "fao_ghg_lu" FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All ROW regions\' GROUP BY "year" ORDER BY "year"';
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

app.get('/Page1_FoodEnergy:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        
        switch (GraficaType) {
            case "group":
                var query = 'SELECT "year" as "Year", ROUND((avg("kcal_feas"))::numeric,2) AS "Kcal_feasible", ROUND((avg("kcal_targ"))::numeric,2) AS kcal_target, ROUND(avg("kcal_mder")::numeric,2) AS "Target_MDER" FROM public.indicators19 WHERE iteration=$1  GROUP BY "year" ORDER BY "year"';
                break;
            case "countries":
                var query = 'SELECT "year" as "Year", ROUND((avg("kcal_feas"))::numeric,2) AS "Kcal_feasible", ROUND((avg("kcal_targ"))::numeric,2) AS kcal_target, ROUND(avg("kcal_mder")::numeric,2) AS "Target_MDER" FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All FABLE countries\' GROUP BY "year" ORDER BY "year"';
                break;
            case "regions":
                var query = 'SELECT "year" as "Year", ROUND((avg("kcal_feas"))::numeric,2) AS "Kcal_feasible", ROUND((avg("kcal_targ"))::numeric,2) AS "kcal_target", ROUND(avg("kcal_mder")::numeric,2) AS "Target_MDER" FROM public.indicators19 WHERE iteration=$1  AND "group"= \'All ROW regions\' GROUP BY "year" ORDER BY "year"';
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
app.get('/Page2_NetForestCoverChange:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT i.year,c.country,sum(netforest_change) FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "countries":
                var query = 'SELECT i.year,c.country,sum(netforest_change) FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 AND "group"= \'All FABLE countries\' group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "regions":
                var query = 'SELECT i.year,c.country,sum(netforest_change) FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 AND "group"= \'All ROW regions\' group by (c.country,i.year) order by (c.country,i.year)';
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
app.get('/Page2_Biodiversity:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT i.year as "Year", c.country as "Country", sum(i.biodivshareland) as "Biodiversity_Land" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1  AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "countries":
                var query = 'SELECT i.year as "Year", c.country as "Country", sum(i.biodivshareland) as "Biodiversity_Land" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 AND "group"= \'All FABLE countries\' group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "regions":
                var query = 'SELECT i.year as "Year", c.country as "Country", sum(i.biodivshareland) as "Biodiversity_Land" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 AND "group"= \'All ROW regions\' group by (c.country,i.year) order by (c.country,i.year)';
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
app.get('/Page2_GreenhouseGas:combinations', async (req, res) => {
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT i.year as "Year", c.country as "Country", ROUND(sum(i.totalghgagric)::numeric,2) as "Total_GHG_agric", ROUND(avg(i.totalghglar)::numeric,2) as "total_GHG_land" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "countries":
                var query = 'SELECT i.year as "Year", c.country as "Country", ROUND(sum(i.totalghgagric)::numeric,2) as "Total_GHG_agric", ROUND(avg(i.totalghglar)::numeric,2) as "total_GHG_land" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND "group"= \'All FABLE countries\'  AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "regions":
                var query = 'SELECT i.year as "Year", c.country as "Country", ROUND(sum(i.totalghgagric)::numeric,2) as "Total_GHG_agric", ROUND(avg(i.totalghglar)::numeric,2) as "total_GHG_land" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND "group"= \'All ROW regions\'  AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
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
app.get('/Page2_FoodEnergy:combinations', async (req, res) => {
    
    try {

        const { Iteration, GraficaType } = JSON.parse(req.params.combinations).select;
        switch (GraficaType) {
            case "group":
                var query = 'SELECT i.year as "Year", c.country as "Country", ROUND((avg("kcal_feas"))::numeric,2) AS "Kcal_feasible" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "countries":
                var query = 'SELECT i.year as "Year", c.country as "Country", ROUND((avg("kcal_feas"))::numeric,2) AS "Kcal_feasible" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND "group"= \'All FABLE countries\'  AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
                break;
            case "regions":
                var query = 'SELECT i.year as "Year", c.country as "Country", ROUND((avg("kcal_feas"))::numeric,2) AS "Kcal_feasible" FROM indicators19 as i inner join countries as c on i.country_id=c.country_id where iteration=$1 AND "group"= \'All ROW regions\'  AND i.year > 2000 group by (c.country,i.year) order by (c.country,i.year)';
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