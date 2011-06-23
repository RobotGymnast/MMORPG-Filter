// ==UserScript==
// @name            Highlight games
// @include         http://www.mmorpg.com/gamelist.cfm
// @include         http://www.mmorpg.com/gamelist.cfm/*
// ==/UserScript==

if(unsafeWindow)
{
    $ = unsafeWindow.$;
    setInterval = unsafeWindow.setInterval;
    clearInterval = unsafeWindow.clearInterval;
    window = unsafeWindow;
}

function FilterSet(storage)
{
    // TODO: Have an interface to settings these members.
    
    function getStorageArray(name)
    {
        var text = storage.getItem(name);

        if(text)
            return text.split(",");

        return [];
    }

    function setStorageArray(name, array)
    {
        storage.setItem(name, array.toString());
    }

    this.getBadStatuses = function()
    {
        return getStorageArray("badStatuses");
    }

    this.setBadStatuses = function(badStatuses)
    {
        setStorageArray("badStatuses", badStatuses);
    }

    this.getBadGenres = function()
    {
        return getStorageArray("badGenres");
    }

    this.setBadGenres = function(badGenres)
    {
        setStorageArray("badGenres", badGenres);
    }

    this.getBadGames = function()
    {
        return getStorageArray("badGames");
    }

    this.setBadGames = function(badGames)
    {
        setStorageArray("badGames", badGames);
    }
}

// Log `msg` to whatever logging facilities are available.
function log(msg)
{
    if(window.console) window.console.log(msg);
    if(GM_log) GM_log(msg);
}

// Returns true iff `elem` is in `array`.
function matchesAny(elem, array, match)
{
    if(match == undefined)
        match = function(a, b) { return a == b; }

    for(x in array)
        if(match(elem, array[x]))
            return true;

    return false;
}

// Check if `a` matches `b`, case insensitive.
function stringMatch(a, b)
{
    return a.toLowerCase() == b.toLowerCase();
}

function matchesHideCriteria(game, filters)
{
    var cells = game.children("td");

    // If the genre is undesirable.
    if(matchesAny(cells.filter(".genre").html().toLowerCase(), filters.getBadGenres(), stringMatch))
        return true;

    // If the name is undesirable;
    if(matchesAny(cells.find("a").html().toLowerCase(), filters.getBadGames(), stringMatch))
        return true;

    // If there's something in the "subscription pay" column.
    var payImgs = cells.filter(".pay.alt").children("img");
    if(payImgs.length >= 3 && payImgs.eq(2).attr("src").indexOf("blank") == -1)
        return true;

    // If the game's status is undesirable.
    var devImgs = cells.filter(".status.name.first").children("img");
    if(devImgs.length >= 1 && matchesAny(devImgs.eq(0).attr("title").toLowerCase(), filters.getBadStatuses(), stringMatch))
        return true;

    return false;
}

function matchesHighlightCriteria(game)
{
    return true;
}

function highlightText(text)
{
    text.css("font-weight", "bold");
}

function handleRow(row, filters)
{
    // If it's just a filler row, exit.
    if(row.attr("id").substr(0, 6) != "glrow_")
        return;

    if(matchesHideCriteria(row, filters))
        row.hide();
    else if(matchesHighlightCriteria(row))
        highlightText(row.children("td").eq(1).closest("a"));
}

// TODO: Clear out all unused filter elements (e.g. duplicate games).
function fixGameList(filters)
{
    var games = $("#gamelisttable > tbody > tr");

    for(var i = 0; i < games.length; ++i)
        handleRow(games.eq(i), filters);
}

$(document).ready(function()
    {
        if(window.localStorage == undefined)
        {
            var error = "Error: Browser support for local storage is not enabled. Quitting.";
            log(error);
            alert(error);
            return;
        }

        var filters = new FilterSet(window.localStorage);
        fixGameList(filters);
    }
);

