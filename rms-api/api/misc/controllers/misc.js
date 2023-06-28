'use strict';
const axios = require('axios');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {




    async validateRecaptcha(ctx) {

        let token = ctx.request.body.recaptcha;
        var secretKey = "6Lfjb9gZAAAAAI6LFBnvvdHJlCn0GygciG6bTTub";

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`

        if (token === null || token === undefined) {
            ctx.throw(400, { success: false, message: "Token is empty or invalid" })
            return console.log("token empty");
        }

        var verificationRes = await axios.post(url)

        if (verificationRes.data.success) {
            return { success: true }
        } else {
            ctx.throw(401, { success: false, message: "Token is invalid" })
        }

    }

};
