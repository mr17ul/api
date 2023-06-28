const axios = require('axios');

const apiKey = "4ds6g5V1vEu6rRIin08IZg"
const senderId = "NOCPLT"
const channel = 2
const dcs = 0
const route = 1

module.exports = {
    async send(receipients,message){
        message = encodeURI(message)
        var url = `http://sms.cimssoft.com/api/mt/SendSMS?APIKey=${apiKey}&senderid=${senderId}&channel=${channel}&DCS=${dcs}&flashsms=0&number=${receipients.join(',')}&text=${message}&route=${route}`
        var res =  await axios.get(url)
        if(res.data.ErrorCode == "000"){
            return true
        }
        return false
    }
}