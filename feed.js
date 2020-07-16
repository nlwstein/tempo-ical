const ical = require('ical-generator');
const moment = require('moment'); 
const axios = require('axios'); 
require('datejs');
const TEMPO_TOKEN = process.env.TEMPO_TOKEN;
require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const ipfilter = require('express-ipfilter').IpFilter

app.get('/ical/:userId', (req, res) => {
    const from = Date.today().addMonths(-1).toString("yyyy-MM-dd");
    const to = Date.today().addMonths(2).toString("yyyy-MM-dd");
    const url = `https://api.tempo.io/core/3/plans/user/${req.params.userId}?from=${from}&to=${to}`;
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${TEMPO_TOKEN}`
        }
    }).then(function (response) {
        var calendar = ical({
            domain: 'trellis.co',
            // prodId: '//superman-industries.com//ical-generator//EN',
            events: response.data.results.map(function (plan) {
                const ticket = plan.planItem.self.replace(process.env.REST_API_URL_FRAGMENT, "");
                return {
                    start: moment(plan.startDate),
                    end: moment(plan.endDate),
                    timestamp: moment(),
                    summary: ticket + " | " + plan.description,
                    url: process.env.GUI_URL_FRAGMENT + ticket,
                    organizer: 'Tempo Planner iCal <tpi@trellis.co>'
                }
            })
        }).toString();
        
        res.send(calendar); 
    });
})

// START WHITELIST
let whitelist_ips = process.env.IP_WHITELIST.split(",");
let clientIp = function(req, res) {
  return req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for']).split(',')[0] : ""
}
app.use(
  ipfilter({
    id: clientIp,
    forbidden: 'You are not authorized to access this page.',
    strict: false,
    filter: whitelist_ips,
  })
);
// END WHITELIST

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


