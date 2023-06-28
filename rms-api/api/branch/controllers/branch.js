'use strict';

const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx) {
        if (ctx.state.user.role.type != 'cms_admin') {
            ctx.query["users.id"] = ctx.state.user.id
        }
        var branches = await strapi.services.branch.find(ctx.query)
        return branches
    },

    async create(ctx) {
        let userDistrictRegions = await strapi.services['user-regions'].find({ 'districts.code': ctx.request.body.district.code })
        let userStateRegions = await strapi.services['user-regions'].find({ 'states.code': ctx.request.body.district.state.code })

        let users = []
        users = users.concat(userDistrictRegions.map(udr => udr.user))
        users = users.concat(userStateRegions.map(usr => usr.user))

        ctx.request.body.users = users
        let entity = await strapi.services.branch.create(ctx.request.body)
        return sanitizeEntity(entity, { model: strapi.models.branch })
    }

};
