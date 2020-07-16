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
                const url = process.env.GUI_URL_FRAGMENT + ticket;
                return {
                    start: moment(plan.startDate),
                    end: moment(plan.endDate),
                    timestamp: moment(),
                    allDay: true,
                    summary: ticket + (plan.description ? " | " + plan.description : ""),
                    url: url,
                    description: (plan.description ? " | " + plan.description : "") + url,
                    organizer: 'Tempo Planner iCal <tpi@trellis.co>'
                }
            })
        }).toString();
        res.type("text/calendar")
        res.send(calendar); 
    });
})

// START WHITELIST
/* app.use(function (req, res, next) {
    var get_ip = require('ipware')().get_ip;
    var whitelist = process.env.IP_WHITELIST.split(",", -1); 
    const ip = get_ip(req).clientIp;
    if (whitelist.includes(ip)) {
        return next();
    }
    console.log('BAD IP: ' + ip); 
    return res.send("IP NOT ALLOWED"); 
}); */ 
// END WHITELIST

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


