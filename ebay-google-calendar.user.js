// ==UserScript==
// @name         Add Ebay Auctions to Google Calendar
// @namespace    https://github.com/dwbfox
// @version      0.1.7
// @description  Add Ebay Auction Deadlines to Google Calendar
// @author       dwbfox
// @license      GPLv3
// @match        *://*.ebay.de/itm/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js
// @run-at       document-end
// ==/UserScript==
(function () {
    'use strict';

    // Calendar services we can send
    // the auction deadline to
    var services = {
        "google": {
            "name": "Google Calendar",
            "callback": generateGcalLink,
            "dateRegex": /-|:|\.\d{3}/g
        }
    };

    // @TODO Make this a user-editable option
    var defaultService = services.google;

    /**
     * Gets the auction end date.
     *
     * @method     getAuctionEndDate
     * @return     {Date} date object with of the auction end date
     */
    function getAuctionEndDate() {
        var endDate = new Date();
        try {
            //endDate.setTime(document.querySelector('.timeMs').getAttribute('timems'));
            var dateString = document.querySelector('.vi-tm-left').innerText.replace('(', '').replace(')','')
            var ex = "09. Jan. 2020 15:54:55 MEZ"
            var m = moment(dateString, 'DD. MMM. YYYY HH:mm:ss', 'de');
            console.log("Moment", m)
            endDate = m.toDate()
        } catch (Exception) {
            throw new Error('End date not found. This page is likely not an auction page or the HTML structure has changed.');
        }
        return endDate.toISOString().replace(defaultService.dateRegex, '');
    }


    /**
     * Generates the Google Calendar link.
     *
     * @method     generateGcalLink
     * @return     {string}  the URL to create the calendar event
     */
    function generateGcalLink() {
        var eventDate = getAuctionEndDate();
        var eventName = 'Auction for: ' + document.title.split('|')[0] + ' ends.\n\n';
        var eventDetail = eventName + ' ' + window.location.href;
        return encodeURI('https://www.google.com/calendar/render?action=TEMPLATE&text=' + eventName +
            '&dates=' + eventDate + '/' + eventDate + '&details=' + eventDetail + '&location=');
    }


    /**
     * Renders the button on the page
     *
     * @method     renderButton
     */
    function renderButton() {
        // Outer div
        var container = document.createElement('div');
        container.setAttribute('id', 'gAddToCalendar');

        // Render button
        var button = document.createElement('a');
        button.setAttribute('class', 'btn btn-ter');
        button.innerText = 'Add to ' + defaultService.name;
        button.setAttribute('style', 'margin-top: 3px;');

        // Add links
        // In the future, this would be set dynamically per issue #1
        var calLink = defaultService.callback();
        button.setAttribute('href', calLink);
        button.setAttribute('role', 'button');
        button.setAttribute('target', '_blank');

        // Insert into doc
        container.appendChild(button);
        document.querySelector('.vi-tm-left').appendChild(container);
        return button;
    }
    console.info("Rendering button...");
    renderButton();
})();
