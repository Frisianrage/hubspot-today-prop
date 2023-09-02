import express from "express"
import dotenv from "dotenv"
import {getAllCompanies, updateTimeProp} from "./hubspot.js"
import getFormattedDate from "./formattedDate.js";
import {CronJob} from "cron";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const token = process.env.HUBSPOT_TOKEN

app.get('/', (req, res) => {
    res.send('API is running...')
})
//cron job executes every night at 12:00am PDT
const job = new CronJob({
    cronTime: '00 00 00 * * *',
    onTick: () => {
        const today = getFormattedDate(new Date()) 
        console.log(new Date())
        getAllCompanies(token)
        .then((response) =>{updateTimeProp(token,response, today)})
        .then(console.log("Update done! Date is " + today))
        .catch((e) => {
            console.error(e.message)
          })
    },
    timeZone: 'America/Los_Angeles'
});

app.listen(
    PORT, 
    console.log(`Server is running in port ${PORT}`),
    job.start(),
    console.log('is job running? ', job.running) 
)   