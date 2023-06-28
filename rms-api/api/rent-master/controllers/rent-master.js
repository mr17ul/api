'use strict';

const { find } = require("../../branch-action/controllers/branch-action");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx) {

        var rentMasters = await strapi.services['rent-master'].find({ _limit: -1 })
        rentMasters.forEach(rm => {
            var adjustActions = rm.branch_actions.filter(ba => ba.action == 'adjust')
            rm.BalDepositAmount = parseFloat(rm.DepositAmount)
            adjustActions.forEach(adj => {
                var date = new Date(adj.actionMonth)
                rm.BalDepositAmount -= this.payableForMonth(date.getMonth(), date.getFullYear(), rm).sum
            })
        })

        return rentMasters

    },

    async dashboard(ctx) {
        var rentMasters = await strapi.services['rent-master'].find({ _limit: -1 })

        var branchCount = rentMasters.length

        var today = new Date()
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        var totalRent = 0
        var totalSecurityDep = 0
        var expiringAgreements = []
        var lastMonthTotalRent = 0
        var incrementThisMonth = []

        var stateWise = {}


        rentMasters.forEach(rm => {
            if (!stateWise[rm.state.id]) {
                stateWise[rm.state.id] = {
                    expiringAgreements: [],
                    newAgreements: [],
                    totalRent: 0,
                    lastMonthTotalRent: 0,
                    totalBranches: 0,
                    incrementThisMonth: [],
                    state: rm.state
                }
            }
            var stateObj = stateWise[rm.state.id]

            stateObj.totalBranches++
            var thisMonthRent = this.payableForMonth(today.getMonth(), today.getFullYear(), rm).sum
            totalRent += thisMonthRent
            stateObj.totalRent += thisMonthRent

            totalSecurityDep += Number.parseFloat(rm.DepositAmount)

            if (rm.rent_details.length > 0) {
                var descRentDetails = rm.rent_details.sort((prd1, prd2) => Date.parse(prd2.ToDate) - Date.parse(prd1.ToDate))
                var lastAgrmt = descRentDetails[0]
                var agreementDate = new Date(Date.parse(lastAgrmt.ToDate))
                if (agreementDate >= firstDay && agreementDate <= lastDay) {
                    expiringAgreements.push(rm)
                    stateObj.expiringAgreements.push(rm)
                }

                // var lastMonthRent = this.payableForMonth(today.getMonth() - 1, today.getFullYear(), rm).sum
                // lastMonthTotalRent += lastMonthRent

                // stateObj.lastMonthTotalRent += lastMonthRent

                if (rm.rent_details.length > 1) {
                    var ascRentDetails = descRentDetails.reverse()
                    var thisMonthAgreementIndex = ascRentDetails.findIndex(rd => Date.parse(rd.From) >= firstDay && Date.parse(rd.From) <= lastDay)
                    if (thisMonthAgreementIndex > 0 && ascRentDetails[thisMonthAgreementIndex].RentAmount > ascRentDetails[thisMonthAgreementIndex - 1].RentAmount) {
                        incrementThisMonth.push(rm)
                        stateObj.incrementThisMonth.push(rm)
                    }
                }

            }



        })

        var avgRent = totalRent / branchCount
        //var incrementThisMonth = totalRent - lastMonthTotalRent

        return {
            branchCount: branchCount, totalRentForMonth: totalRent, avgRent: avgRent,
            totalSecurityDep: totalSecurityDep, agreementExpiring: expiringAgreements,
            totalIncrementThisMonth: incrementThisMonth, stateWise: stateWise
        }

    },

    async monthlyReport(ctx) {
        var month = ctx.params.month - 1
        var year = ctx.params.year

        var fromMonth = ctx.params.fromMonth - 1
        var fromYear = ctx.params.fromYear

        var rentMasters = await strapi.services['rent-master'].find({ 'state.id': ctx.params.state, '_limit': -1 })

        /**
         *  loop
         *    if month-year falls in rent details period
         *      capture dates for period
         *       pro-rate 
         *       sum
         *       store
         * 
         *   edge case
         *     no period = 0 rent
         *     overlap period = error 
         */
        rentMasters = rentMasters.filter(rm => {
            if (rm.ValidUntil) {
                var expiry = new Date(rm.ValidUntil)
                return expiry.getFullYear() >= fromYear && expiry.getMonth() >= fromMonth
            }
            return true
        })

        console.log(fromMonth + '/' + fromYear)
        console.log(month + '/' + year)

        var months = []

        var date = new Date(fromYear, fromMonth)
        var toDate = new Date(year, month + 1, 0)

        while (date <= toDate) {
            months.push(new Date(date))
            date.setMonth(date.getMonth() + 1)
        }


        rentMasters.forEach(rm => {
            rm.payableRent = []
            rm.payableDays = []
            rm.daysInMonth = []
            rm.rentRemarks = []
            months.forEach(m => {
                var payable = this.payableForMonth(m.getMonth(), m.getFullYear(), rm)
                rm.payableRent.push(payable.sum)
                rm.payableDays.push(payable.totalDays)
                rm.daysInMonth.push(payable.daysInMonth)
                // Hold/Adjust actions
                var holdActions = rm.branch_actions.filter(ba => new Date(ba.actionMonth).getMonth() == month
                    && new Date(ba.actionMonth).getFullYear() == year)
                if (holdActions.length > 0) {
                    rm.rentRemarks.push(holdActions[0].action == 'hold' ? 'Hold' : 'Adjust')
                }
            })

        });

        return rentMasters

    },

    async branchStatement(ctx) {
        var rmId = ctx.params.rmId
        var from = new Date(parseInt(ctx.params.from))
        var to = new Date(parseInt(ctx.params.to))

        var txnDetails = (await strapi.services['transaction-details'].find({ 'rent_master.id': rmId })).filter(tx => {
            var txnDate = new Date(tx.txn_date)
            return txnDate.getTime() >= from.getTime() && txnDate.getTime() <= to.getTime()
        })

        var rentMaster = (await strapi.services['rent-master'].find({ id: rmId }))[0]

        var adjustActions = rentMaster.branch_actions.filter(ba => ba.action == 'adjust')
        rentMaster.BalDepositAmount = parseFloat(rentMaster.DepositAmount)
        adjustActions.forEach(adj => {
            var date = new Date(adj.actionMonth)
            rentMaster.BalDepositAmount -= this.payableForMonth(date.getMonth(), date.getFullYear(), rentMaster).sum
        })

        return { rentMaster: rentMaster, txn: txnDetails }
    },

    payableForMonth(month, year, rm) {
        var fromDate = new Date(year, month, 1)
        var toDate = new Date(year, month + 1, 0)

        const _MS_PER_DAY = 1000 * 60 * 60 * 24;

        var daysInMonth = toDate.getDate()

        // If branch closed before requested to date, limit to closing date
        var validUntil = new Date(rm.ValidUntil)
        if (validUntil.getTime() != new Date(0).getTime() && toDate > validUntil) {
            toDate = validUntil
        }



        var rentPeriod = rm.rent_details.filter(rd =>
            this.isOverlap(fromDate, toDate, new Date(Date.parse(rd.From)), new Date(Date.parse(rd.ToDate)))
        )

        var sum = 0
        var totalDays = 0
        rentPeriod.forEach(rd => {
            var fromDate2 = new Date(Date.parse(rd.From))
            var toDate2 = new Date(Date.parse(rd.ToDate))

            var days = 0
            if (fromDate >= fromDate2) {
                days = Math.ceil(Math.abs(fromDate - Math.min(toDate2, toDate)) / _MS_PER_DAY)
            } else {
                days = Math.ceil(Math.abs(fromDate2 - Math.min(toDate2, toDate)) / _MS_PER_DAY) + 1
            }

            // If it's a full month rent period (no multiple rent periods)
            if (daysInMonth == days + 1) {
                sum += Number.parseFloat(rd.RentAmount)
            } else {
                sum += Number.parseFloat(rd.RentAmount) / daysInMonth * days
            }

            totalDays += days
        })

        var holdActions = rm.branch_actions.filter(ba => ba.action == 'hold'
            && new Date(ba.actionMonth).getMonth() == month - 1
            && new Date(ba.actionMonth).getFullYear() == year)

        if (holdActions.length > 0) {
            sum += Number.parseFloat(rentPeriod[0].RentAmount)
        }

        return { sum: sum, totalDays: totalDays, daysInMonth: daysInMonth }

    },

    isOverlap(frmDate1, toDate1, frmDate2, toDate2) {
        return (toDate2 >= frmDate1 && frmDate2 <= toDate1)
    }
};
