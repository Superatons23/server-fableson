if(process.env.NODE_ENV==='development'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const cors = require("cors");
const pool = require('./db');
const { json } = require('express');
let port = process.env.PORT || 5000;

console.log(`entorno de desarrollo->${process.env.NODE_ENV}`);

app.use(cors());

//(middleware)
app.use(express.json());


//build routes with PostgreSQL queries
app.listen(port, () => {
    console.log(`listening ${port}`);
});

//routes
app.get('/testeo', async (req, res) => {
   console.log("entre")
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

        const { Product, iteration, scenathon_id, column } = JSON.parse(req.params.combinations).select;
        if (column === "Import_quantity") {
            var query = 'SELECT "name",   "Year", ROUND("Import_quantity"::numeric,2) as "Import_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3 AND "Import_quantity"!=0 ORDER BY "Year","name" ASC  ';
        } else {
            var query = 'SELECT "name", "Year", ROUND("Export"::numeric,2) as "Export_quantity" FROM nettrade WHERE "Product"=$1 AND "iteration"=$2 AND "scenathon_id"=$3 AND "Export_quantity"!=0 ORDER BY "Year","name" ASC ';
        }
        const response = await pool.query(query, [Product, iteration, scenathon_id]);
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

app.get('/target2:combinations', async (req, res) => {
    try {
        const { iteration, scenathon, group } = JSON.parse(req.params.combinations).select;
        switch (group) {
            case "group":
                var query = 'SELECT "resultsScen2020"."Year", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / SUM("resultsScen2020"."TotalLand"))::numeric,2) AS "Protected_Land" FROM "resultsScen2020" WHERE "resultsScen2020"."iteration" = $1 and "resultsScen2020"."scenathon_id" = $2  GROUP BY "resultsScen2020"."Year" ORDER BY "resultsScen2020"."Year"';
                break;
            case "countries":
                var query = 'SELECT "resultsScen2020"."Year", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / SUM("resultsScen2020"."TotalLand"))::numeric,2) AS "Protected_Land" FROM "resultsScen2020" WHERE "resultsScen2020"."iteration" = $1 and "resultsScen2020"."scenathon_id" = $2 GROUP BY "resultsScen2020"."Year" AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' ORDER BY "resultsScen2020"."Year"';
                break;
            case "regions":
                var query = 'SELECT "resultsScen2020"."Year", ROUND(((SUM("resultsScen2020"."ProtectedAreasForest" + "resultsScen2020"."ProtectedAreasOtherNat" +"resultsScen2020"."ProtectedAreasOther")) / SUM("resultsScen2020"."TotalLand"))::numeric,2) AS "Protected_Land" FROM "resultsScen2020" WHERE "resultsScen2020"."iteration" = $1 and "resultsScen2020"."scenathon_id" = $2 GROUP BY "resultsScen2020"."Year" AND "Country" LIKE \'%$_%\' ESCAPE \'$\' ORDER BY "resultsScen2020"."Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [iteration, scenathon]);
        res.status(200).json(response.rows);
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/target3:combinations', async (req, res) => {
    try {
        const { iteration, scenathon, group } = JSON.parse(req.params.combinations).select;
        switch (group) {
            case "group":
                var query = 'SELECT "Year", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_Land" , ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversyty" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 GROUP BY "Year" ORDER BY "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_Land" , ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversyty" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2  AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_Land" , ROUND(AVG("BiodivTarget")::numeric,2) AS "Target_Biodiversyty" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [iteration, scenathon]);
        res.status(200).json(response.rows);
         
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/target5:combinations', async (req, res) => {
    try {
        const { iteration, scenathon, group } = JSON.parse(req.params.combinations).select;
        switch (group) {
            case "group":
                var query = 'SELECT "Country", ROUND((avg("kcal_feas"))::numeric,2) AS Kcal_feasible, ROUND(avg("kcal_mder")::numeric,2) AS Target_MDER FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = 2030 GROUP BY "Country" ORDER BY "Country";';
                break;
            case "countries":
                var query = 'SELECT "Country", ROUND((avg("kcal_feas"))::numeric,2) AS Kcal_feasible, ROUND(avg("kcal_mder")::numeric,2) AS Target_MDER FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = 2030 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ORDER BY "Country";';
                break;
            case "regions":
                var query = 'SELECT "Country", ROUND((avg("kcal_feas"))::numeric,2) AS Kcal_feasible, ROUND(avg("kcal_mder")::numeric,2) AS Target_MDER FROM "resultsScen2020" WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Year" = 2030 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ORDER BY "Country";';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [iteration, scenathon]);
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
        res.status(200).json(response.rows)
         
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
                var query = 'SELECT "Year","Country", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_land" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_land" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country","Year" ORDER BY "Country","Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country", ROUND((avg("CalcBiodivLnd"))::numeric,2) AS "Biodiversity_land" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country","Year" ORDER BY "Country","Year"';
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

        const { iteration, scenathon, group } = JSON.parse(req.params.combinations).select;
        switch (group) {
            case "group":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "Net Forest Change" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2  GROUP BY "Year" ORDER BY "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "Net Forest Change" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year", ROUND(SUM("NetForestChange")::numeric,2) as "Net Forest Change" FROM "resultsScen2020"  WHERE "iteration" = $1 AND "scenathon_id" = $2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" ORDER BY "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [iteration, scenathon]);
        res.status(200).json(response.rows);
         
    } catch (err) {
        console.error(err.message);
    }
});
app.get('/target6:combinations', async (req, res) => {
    try {

        const { iteration, scenathon, group } = JSON.parse(req.params.combinations).select;
        switch (group) {
            case "group":
                var query = 'SELECT "Year",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 GROUP BY "Year" Order by "Year"';
                break;
            case "countries":
                var query = 'SELECT "Year",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater" from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            case "regions":
                var query = 'SELECT "Year",ROUND(sum("CalcWFblue")::numeric,2) as "BlueWater from "resultsScen2020" WHERE "iteration"=$1 and "scenathon_id"=$2 AND "Year"=2050 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Year" Order by "Year"';
                break;
            default:
                var query = null;
                break;
        }
        const response = await pool.query(query, [iteration, scenathon]);
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

app.get('/netforest2:combinations', async (req, res) => {
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
                var query = 'SELECT "Year","Country",ROUND(sum("CalcAllAgriCO2e")::numeric,2) as "AgriCO2e",ROUND(avg("CalcAllLandCO2e")::numeric,2) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            case "countries":
                var query = 'SELECT "Year","Country",ROUND(sum("CalcAllAgriCO2e")::numeric,2) as "AgriCO2e",ROUND(avg("CalcAllLandCO2e")::numeric,2) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" NOT LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
                break;
            case "regions":
                var query = 'SELECT "Year","Country",ROUND(sum("CalcAllAgriCO2e")::numeric,2) as "AgriCO2e",ROUND(avg("CalcAllLandCO2e")::numeric,2) as "LandCO2e" FROM "resultsScen2020" WHERE "iteration"=$1 AND "scenathon_id"=$2 AND "Country" LIKE \'%$_%\' ESCAPE \'$\' GROUP BY "Country" ,"Year" ORDER BY "Country" ,"Year"';
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
