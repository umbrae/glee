var prefs = {};
var textfieldTimer = null;
var scroller;

function addURL(value) {
    prefs.disabledUrls.push(value);
    saveOption("disabledUrls", prefs.disabledUrls);
}

function addScraper(value) {
    prefs.scrapers.push(value);
    saveOption("scrapers", prefs.scrapers);
}

function addESP(value) {
    prefs.espModifiers.push(value);
    saveOption("espModifiers", prefs.espModifiers);
}

function addItem(type, value1, value2, shouldSave) {
    var listOfItems;
    var lastEl;
    var content;
    var no = $('li.' + type).length;
    
    var container = $('<li>', {
       id: type + no,
       className: type,
       tabIndex: 0
    });
    
    switch (type) {
        case "domain":
        
            var domainName = document.getElementById("add_domain");
            
            if (!value1)
            {
                value1 = domainName.value;
                domainName.value = "";
            }

            if (validateURL(value1))
            {
                listOfItems = document.getElementById("domains");
                lastEl = document.getElementById("addDomainLI");
                
                content = $('<span>', {
                    className: "domain-name",
                    html: value1
                });
                
                container.append(content);
                
                if (shouldSave) {
                    addURL(value1);
                }
            }
            
            else
                return false;
            
            break;
            
        case "scraper":
            var scraperName = document.getElementById("add-scraper-name");
            var scraperSel = document.getElementById("add-scraper-selector");
            
            if (!value1)
            {
                value1 = scraperName.value;
                value2 = scraperSel.value;
                scraperName.value = "";
                scraperSel.value = "";
            }

            if (validateScraper(value1, value2))
            {
                listOfItems = document.getElementById("scraper-commands");
                lastEl = document.getElementById("addScraper");
                
                var contentName = $('<span>', {
                    className: "scraper-name",
                    html: value1
                });
                
                var contentSelector = $('<span>', {
                    className: "scraper-sel selector",
                    html: value2
                });
                
                var prefix = $("<span class='scraper-prefix'>?</span>");

                var separator = $('<div>', {
                    className: 'separator'
                });

                container.append(prefix)
                .append(contentName)
                .append(separator)
                .append(contentSelector);
                
                if (shouldSave) {
                    addScraper({ command: value1, selector: value2, cssStyle: "GleeReaped", nullMessage: "Could not find any elements" });
                }
            }
            
            else
                return false;
            
            break;

        case "esp":
            var espUrl = document.getElementById("add-esp-url");
            var espSel = document.getElementById("add-esp-selector");
            
            if (!value1)
            {
                value1 = espUrl.value;
                value2 = espSel.value;
                espUrl.value = "";
                espSel.value = "";
            }
            
            if (validateEspModifier(value1, value2))
            {
                listOfItems = document.getElementById("esp-modifiers");
                lastEl = document.getElementById("addEspModifier");
                
                var contentName = $('<span>', {
                    className: "esp-url",
                    html: value1
                });
                
                var contentSelector = $('<span>', {
                    className: "esp-sel selector",
                    html: value2
                });
                
                var separator = $('<div>', {
                    className: 'separator'
                });
                
                container.append(contentName)
                .append(separator)
                .append(contentSelector);
                
                if (shouldSave) {
                    addESP({url: value1, selector: value2});
                }
            }
            
            else
                return false;
    }
    
    var closeButton = $("<a>", {
        className: 'close-button',
        type: 'button',
        href: '#'
    })
    
    .bind('click keydown', function(e) {
        if (e.type === 'keydown' && e.keyCode !=13) return true;
        e.preventDefault();
        removeItem(e, type);
    })
    .appendTo(container);
    
    if (lastEl != undefined)
        listOfItems.insertBefore(container.get(0), lastEl);
    else
        listOfItems.insertBefore(container.get(0), null);
}

function removeItem(e, type) {
    var listOfItems;
    var i = e.target.parentNode.id.substr(type.length);

    switch (type)
    {
        case "domain":
            listOfItems = document.getElementById("domains");
            prefs.disabledUrls.splice(i, 1);
            saveOption("disabledUrls", prefs.disabledUrls);
            break;
            
        case "scraper":
            listOfItems = document.getElementById("scraper-commands");
            prefs.scrapers.splice(i, 1);
            saveOption("scrapers", prefs.scrapers);
            break;
            
        case "esp":
            listOfItems = document.getElementById("esp-modifiers");
            prefs.espModifiers.splice(i, 1);
            saveOption("espModifiers", prefs.espModifiers);
    }
    
    var el = document.getElementById(type + i);
    listOfItems.removeChild(el);
    updateItemIndexes(type);
    
    return 0;
}

function updateItemIndexes(type) {
    var li = $('li.' + type);
    var len = li.length;
    for (var i = 0; i < len; i++)
    {
        li[i].id = type + i;
    }
}

function filter(text) {
    var index1 = 0;
    var index2 = 0;
    while (index1 != -1 || index2 != -1)
    {
        text = text.replace("&lt;", "<").replace("&gt;", ">");
        index1 = text.indexOf("&lt;");
        index2 = text.indexOf("&gt;");
    }
    
    return text;
}

// Validation Methods

function validateURL(url)
{
    if (url == "Page URL" || url == "")
        return false;
    return true;
}

function validateScraper(name, selector)
{
    // check that command name/selector should not be blank
    if (name === "" || selector === "")
        return false;
    // check that command name does not conflict with the default scraper command names
    if (name === "h" || name === "?" || name === "img" || name === "a")
        return false;
    if (name.indexOf('`')!=-1 || selector.indexOf('`')!= -1)
        return false;
    return true;
}

function validateEspModifier(name, selector)
{
    // check that name/selector should not be blank
    if (name === "" || selector === "")
        return false;
    return true;
}

// Backup Methods

function exportSettings() {
    var text = 'Copy the contents of this text field, and save them to a textfile:';
    showBackupPopup(text, 'export');
    $("#settingsText").text(translateForExport(prefs));
}

function importSettings() {
    var text = 'Paste previously exported settings here. This will overwrite all your current settings.';
    showBackupPopup(text, 'import');
    $("#settingsText").text('');
}

function devPackCallback(data) {
    var text = "A collection of our favorite scrapers and visions.";
    showBackupPopup(text, 'importDevPack');
    $("#settingsText").text(data);
}

function importDevPack() {
    $.get('http://thegleebox.com/app/devpack.txt', devPackCallback);
}

// called when import button is clicked
function importAndApply() {
    try {
        var jsonString = $('#settingsText').get(0).value;
        var tempPref = translateForImport(JSON.parse(jsonString));
        // merge
        // tempPref = mergeSettings(tempPref, prefs);
        clearSettings();
        initSettings(tempPref);
        prefs = tempPref;
        saveAllOptions();
        $('#backupInfo').text("Settings successfully imported!");
        hideBackupPopup();
    }
    
    catch(e) {
        $('#backupInfo').text("The import format is incorrect!");
        $('#settingsText').get(0).focus();
    }
}

function applyDevPack() {
    try {
        var jsonString = $('#settingsText').get(0).value;
        var tempPref = translateForImport(JSON.parse(jsonString));
        // merge
        tempPref = mergeSettings(tempPref, prefs);
        prefs.scrapers = tempPref.scrapers;
        prefs.espModifiers = tempPref.espModifiers;
        clearSettings();
        initSettings(prefs);
        saveAllOptions();
        $('#backupInfo').text("Developer Pack successfully imported!");
        hideBackupPopup();
    }
    
    catch(e) {
        $('#backupInfo').text("The import format is incorrect!");
        $('#settingsText').get(0).focus();
    }
}

function mergeSettings(a, b) {
    // for conflicting scrapers/visions, a takes priority
    // merging scrapers
    var a_len = a.scrapers.length;
    var b_len = b.scrapers.length;
    for (var i = 0; i < b_len; i++) {
        var found = false;
        for (var j = 0; j < a_len; j++) {
            if (b.scrapers[i].command === a.scrapers[j].command) {
                found = true;
                break;
            }
        }
        if (!found) {
            a.scrapers.push(b.scrapers[i]);
        }
    }
    
    // merging ESP visions
    var a_len = a.espModifiers.length;
    var b_len = b.espModifiers.length;
    for (var i = 0; i < b_len; i++) {
        var found = false;
        for (var j = 0; j < a_len; j++) {
            if (b.espModifiers[i].url === a.espModifiers[j].url) {
                found = true;
                break;
            }
        }
        if (!found) {
            a.espModifiers.push(b.espModifiers[i]);
        }
    }
    
    return a;
}

function showBackupPopup(infoText, func) {
    var popup = $('#popup');
    if (popup.length === 0)
        initBackupPopup();
        
    if (func === 'import') {
        $('#importButton').show();
        $('#exportButton').hide();
        $('#importDevPackButton').hide();
    }
    else if (func === 'export'){
        $('#importButton').hide();
        $('#exportButton').show();
        $('#importDevPackButton').hide();
    }
    else if (func === 'importDevPack') {
        $('#importDevPackButton').show();
        $('#importButton').hide();
        $('#exportButton').hide();
    }

    $('#backupInfo').html(infoText);
    $('#popup').fadeIn(200);
    
    setTimeout(function()
    {
        var field = $('#settingsText').get(0);
        Utils.selectAllText(field);
        field.focus();
    }, 0);
}

function initBackupPopup() {
    var popup = $('<div/>',{
        id:"popup"
    });
    
    $('<div id="backupInfo"></div>').appendTo(popup);
    $('<textarea id="settingsText"></textarea>').appendTo(popup);
    
    // import settings button
    var importBtn = $('<input type="button" class="button" value="Import Settings" id="importButton" />')
    .appendTo(popup)
    .click(importAndApply);
    
    // import dev pack button
    var importDevPackBtn = $('<input type="button" class="button" value="Import Scrapers & Visions" id="importDevPackButton" />')
    .appendTo(popup)
    .click(applyDevPack);
    
    // copy to clipboard button (displayed in export)
    if (copyToClipboard != undefined) {
        $('<input type="button" class="button" value="Copy to Clipboard" id="exportButton" />')
        .appendTo(popup)
        .click(function(e) {
            copyToClipboard($('#settingsText')[0].value);
        });
    }
    
    $('body').append(popup);
    
    // add events
    $(document).keyup(function(e) {
        if (e.keyCode === 27)
        {
            var backupPopup = $('#popup');
            if (backupPopup.length != 0)
                hideBackupPopup();
        }
    });
    
    $(document).click(function(e) {
        if (e.target.id === "popup"
        || e.target.id === "settingsText"
        || e.target.id === "backupInfo"
        || e.target.type === "button") {
            return true;
        }
        
        var backupPopup = $('#popup');
        
        if (backupPopup.length != 0)
            hideBackupPopup();
    });
}

function hideBackupPopup() {
    $('#popup').fadeOut(200);
}

function clearSettings() {
    // clearing disabled urls
    var parent = document.getElementById("domains");
    $('li.domain').remove();
    $('li.scraper').remove();
    $('li.esp').remove();
}

function attachListeners() {
    // radio
    // for some reason, change event does not fire when using keyboard
    $('input[type=radio]').bind('change keyup', function(e) {
        if (e.type === 'keyup' && e.keyCode === 9)
            return true;
        
        if (e.target.name === "scrolling_key") {
            changeScrollingKey(e.target.value);
            return true;
        }
        
        saveOption(e.target.name, e.target.value);
    });
    
    // checkbox
    $('input[type=checkbox]').bind('change', function(e) {
        if (IS_CHROME) {
            saveOption(e.target.name, (e.target.value) ? 1 : 0);
        }
            
        else {
            saveOption(e.target.name, translateOptionValue(e.target.name, e.target.value));
        }
    });
    
    // textfields
    $('input[type=text]:not(#add_domain, #add-scraper-name, #add-scraper-selector, #add-esp-url, #add-esp-selector, #esp-search-field, #scraper-search-field)').keyup(function(e)
    {
        if (e.keyCode === 9)
            return true;
        
        if (textfieldTimer)
        {
            clearTimeout(textfieldTimer);
            textfieldTimer = null;
        }
        
        textfieldTimer = setTimeout(function() {
            saveOption(e.target.name, e.target.value);
        }, 400);
    });
    
    attachFilteringListeners();
    
    // attach listeners for editing
    $('.scraper, .esp, .domain').live('click keydown', function(e) {
        var $this = $(this);
        
        if ($this.hasClass('selected')) return true;
        if (e.type === 'keydown' && e.keyCode != 13) return true;
        e.preventDefault();
        
        if ($this.hasClass('scraper'))
            editScraper($(this));
        else if ($this.hasClass('esp'))
            editESP($(this));
        else if ($this.hasClass('domain'))
            editDomain($(this));
    });
}

function changeSearchEngine(engine) {
    var value = "http://www.google.com/search?q=";

    switch (engine) {
        case "gssl" : value = "https://encrypted.google.com/search?q="; break;
        case "bing" : value = "http://www.bing.com/search?q="; break;
        case "yahoo": value = "http://search.yahoo.com/search?p="; break;
        case "duckduckgo": value = "http://duckduckgo.com/"; break;
    }
    
    var ui = $('#search_engine');
    
    ui.attr('value', value)
    .keyup();
}

function changeScrollingKey(keyset) {
    var up;
    var down;
    if (keyset === "ws") {
        up = 87;
        down = 83;
    }
    
    else if (keyset === "jk") {
        up = "K".charCodeAt(0);
        down = "J".charCodeAt(0);
    }
    
    if (IS_CHROME) {
        saveOption('up_scrolling_key', up);
        saveOption('down_scrolling_key', down);
    }
    
    else {
        saveOption('upScrollingKey', up);
        saveOption('downScrollingKey', down);
    }
}

function attachFilteringListeners() {
    // scraper
    $("#scraper-search-field")

    .bind('search keyup', function(e) {
        filterScraper(e.target.value);
    })
    
    .keyup(function(e)
    {
        if(e.keyCode === 27)
        {
            $(this).val('')
            filterScraper('');
        }
    });
    
    // esp
    $("#esp-search-field")

    .bind('search keyup', function(e) {
        filterESP(e.target.value);
    })
    
    .keyup(function(e)
    {
        if(e.keyCode === 27)
        {
            $(this).val('')
            filterESP('');
        }
    });
}

function filterESP(value) {
    var espDivs = $(".esp");
    var urls = $(".esp-url");
    var len = espDivs.length;
    for (var i = 0; i < len; i++) {
        var $div = $(espDivs[i]);
        if (urls[i].innerHTML.indexOf(value) == -1)
            $div.hide();
        else
            $div.show();
    }
}

function filterScraper(value) {
    var scraperDivs = $(".scraper, .default-scraper");
    var names = $(".scraper-name, .default-scraper-name");
    var len = scraperDivs.length;
    for (var i = 0; i < len; i++) {
        var $div = $(scraperDivs[i]);
        if (names[i].innerHTML.indexOf(value) == -1)
            $div.hide();
        else
            $div.show();
    }
}

// Initialize tabs
$(document).ready(function() {
    $("ul.menu li:first").addClass("tabActive").show();
    $("#options > div").hide();
    $("#basics").show();
    
    // Click event for tab menu items
    $("ul.menu li").click(function()
    {
        $("ul.menu li").removeClass("tabActive");
        $(this).addClass("tabActive");
        $("#options > div").hide();
        
        // Get DIV ID for content from the href of the menu link
        var activeTab = $(this).find("a").attr("href");
        $(activeTab).fadeIn();
        return false;
    });
});

// smooth scrolling using arrow keys
window.addEventListener('keydown', function(e) {
    if ((e.keyCode === 38 || e.keyCode === 40) && !Utils.elementCanReceiveUserInput(e.target))
    {
        if (e.metaKey || e.ctrlKey || e.shiftKey)
            return true;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (!scroller)
            scroller = new SmoothScroller(4);
        scroller.start((e.keyCode === 38) ? 1 : -1);
        
        function stopScrolling() {
            if (scroller)
                scroller.stop();
            $(window).unbind('keyup', stopScrolling);
        }

        $(window).bind('keyup', stopScrolling);
        return false;
    }
});

/// edit methods

function editScraper($scraper) {
    $scraper.addClass('selected');
    
    var $scraperName = $scraper.find('.scraper-name');
    var $scraperSel = $scraper.find('.scraper-sel');
    
    Utils.editElement($scraperSel);
    Utils.editElement($scraperName);
    
    function onEditingComplete(e) {
        var el = e.target;
        
        if (e.type === "keydown" && e.keyCode != 13 && e.keyCode != 27)
            return true;
        if (e.type === "mousedown" && el.className === 'gleebox-editing-field')
            return true;
        
        Utils.endEditing($scraperName);
        Utils.endEditing($scraperSel);
        
        var id = $scraper.attr('id').slice(7);
        prefs.scrapers[id].command = $scraperName.text();
        prefs.scrapers[id].selector = $scraperSel.text();
        saveOption("scrapers", prefs.scrapers);
        $scraper.removeClass('selected');
        
        $(document).unbind("mousedown", onEditingComplete);
        $(document).unbind("keydown", onEditingComplete);
        
        $scraper.focus();
    }
    
    $(document).bind('keydown', onEditingComplete);
    $(document).bind('mousedown', onEditingComplete);
}

function editDomain($domain) {
    $domain.addClass('selected');
    
    var $domainName = $domain.find('.domain-name');
    
    Utils.editElement($domainName);
    
    function onEditingComplete(e) {
        var el = e.target;
        
        if (e.type === "keydown" && e.keyCode != 13 && e.keyCode != 27)
            return true;
        if (e.type === "mousedown" && el.className === 'gleebox-editing-field')
            return true;
        
        Utils.endEditing($domainName);
        
        var id = $domain.attr('id').slice(6);
        
        prefs.disabledUrls[id] = $domainName.text();
        saveOption("disabledUrls", prefs.disabledUrls);
        
        $domain.removeClass('selected');
        
        $(document).unbind("mousedown", onEditingComplete);
        $(document).unbind("keydown", onEditingComplete);
        
        $domain.focus();
    }
    
    $(document).bind('keydown', onEditingComplete);
    $(document).bind('mousedown', onEditingComplete);
}

function editESP($esp) {
    $esp.addClass('selected');
    
    var $espURL = $esp.find('.esp-url');
    var $espSel = $esp.find('.esp-sel');
    
    Utils.editElement($espSel);
    Utils.editElement($espURL);
    
    function onEditingComplete(e) {
        var el = e.target;
        
        if (e.type === "keydown" && e.keyCode != 13 && e.keyCode != 27)
            return true;
        if (e.type === "mousedown" && el.className === 'gleebox-editing-field')
            return true;
            
        Utils.endEditing($espURL);
        Utils.endEditing($espSel);
        
        var id = $esp.attr('id').slice(3);
        
        prefs.espModifiers[id].url = $espURL.text();
        prefs.espModifiers[id].selector = $espSel.text();
        
        saveOption("espModifiers", prefs.espModifiers);
        
        $esp.removeClass('selected');
        
        $(document).unbind("mousedown", onEditingComplete);
        $(document).unbind("keydown", onEditingComplete);
        
        $esp.focus();
    }
    
    $(document).bind('keydown', onEditingComplete);
    $(document).bind('mousedown', onEditingComplete);
}

function setDefaultShortcutKey() {
    $('[name=shortcut_key]').attr('value', 'g').keyup();
    $('[name=shortcut_key_span]').text(71);
}

function setDefaultTabShortcutKey() {
    $('[name=tab_shortcut_key]').attr('value', '.').keyup();
    $('[name=tab_shortcut_key_span]').text(190);
}