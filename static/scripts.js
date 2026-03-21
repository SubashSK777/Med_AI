var symps = [];
var sbox = document.getElementById("sbox");

$(document).ready(function(){
    $("input").typeahead({
        source: symp_list,
        minLength: 2
    });
    // small hack for typeahead styling
    setTimeout(() => {
        $('.dropdown-menu').addClass('bg-gray-900 border border-medical-border text-white rounded-xl shadow-xl overflow-hidden');
        $('.dropdown-item').addClass('hover:bg-medical-glow/20 px-4 py-2 text-sm cursor-pointer');
    }, 500);

    if(!localStorage.getItem("key")) {
        introJs().start();
        localStorage.setItem("key", "keyValue");
    }
});

function appendNewSymp(name){
    console.log(name);
    symps.push(name.replace("-"," "));
    $("#positive").append('<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20 mr-2">'+ name +'</span>');
    $('#'+name).remove();
}

function deleteSymp(name){
    $('#'+name).remove();
}

function appendSymp(){
    var a = $("#symptom").val();
    if(a) {
        symps.push(a);
        $("#tags").append('<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-medical-glow/10 text-medical-glow border border-medical-glow/20">'+a+'</span>');
        $("#symptom").val("");
    }
}

$("#symp_upload").click(function(){
    if(symps.length === 0) return;
    $.ajax({
        url: '/disease',
        type: 'post',
        data: JSON.stringify({ 'symptoms' : symps }),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(response){
            symps = [];
            SymFunc(response);
        },
    });
});

function sendSymp(){
    $.ajax({
        url: '/find',
        type: 'post',
        data: JSON.stringify({ 'symptoms' : symps }),
        dataType: 'text',
        contentType: "application/json",
        success: function(response){
            symps = [];
            showDis(response);
        },
    });
};

$("#but_upload").click(function(){
    var fd = new FormData();
    var files = $('#file')[0].files[0];
    if(files == undefined ){
        alert("Please insert an image");
    } else {
        fd.append('file',files);
        $("#details").empty().append(`
            <div class="flex flex-col items-center">
                <div class="w-16 h-16 border-4 border-medical-glow/20 border-t-medical-glow rounded-full animate-spin"></div>
                <p class="mt-4 text-medical-glow font-display tracking-widest text-sm">ANALYZING...</p>
            </div>
        `);
        $.ajax({
            url: '/image',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function(response){
                RecieveFunc(response);
            },
        });
    }
});

function SymFunc(data){
    $("#cards").empty();
    $("#details").empty();
    $("#slogan-container").empty();
    sbox.classList.add("hidden");
    
    if(data.length===0){
        $("#cards").append(`
            <div class="bg-medical-panel border border-red-500/30 rounded-2xl p-8 text-center max-w-md w-full boxy mt-8">
                <h5 class="font-display text-xl text-white">No definitive results found</h5>
                <p class="text-gray-400 text-sm mt-3">Please try providing more specific symptoms.</p>
                <a href="/" class="mt-6 inline-block px-6 py-2 rounded-full border border-white text-white hover:bg-white hover:text-black transition-all">Go Back</a>
            </div>
        `);
    } else {
        $("#details").append(`
            <h3 class="font-display text-3xl font-light text-white mb-6">Diagnostic Clarification</h3>
            <p class="text-gray-400 mb-8 max-w-lg text-center">Please verify if you are experiencing any of the following additional symptoms to narrow down the diagnosis.</p>
        `);
        
        data.forEach(function(name){
            var idName = name.replace(/\\s/g,'-');
            $("#cards").append(`
                <div class="bg-medical-panel backdrop-blur-xl border border-medical-border rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-full md:w-[calc(50%-12px)] boxy flex flex-col items-center" id="${idName}">
                    <p class="text-xs text-medical-glow uppercase tracking-widest mb-2">Do you feel</p>
                    <h4 class="font-display text-xl text-white font-medium mb-6 capitalize">${name}?</h4>
                    <div class="flex gap-4 w-full">
                        <button class="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white transition-all" onclick="appendNewSymp('${idName}')">YES</button>
                        <button class="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all" onclick="deleteSymp('${idName}')">NO</button>
                    </div>
                </div>
            `);
        });

        $("#cards").append(`
            <div class="bg-blue-900/10 backdrop-blur-xl border border-blue-400/30 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-full md:w-[calc(50%-12px)] boxy flex flex-col items-center">
                <p class="text-xs text-blue-400 uppercase tracking-widest mb-4">Confirmed Symptoms</p>
                <div id="positive" class="flex flex-wrap gap-2 justify-center mb-6 min-h-[30px] w-full p-2 bg-black/30 rounded-lg border border-white/5"></div>
                <button onclick="sendSymp()" class="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold tracking-wider hover:bg-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">FINALIZE SEARCH</button>
            </div>
        `);
    }
}

function showDis(data){
    $("#cards").empty();
    $("#details").empty();
    $("#details").append(`
        <div class="bg-medical-panel border border-medical-glow/30 rounded-2xl p-10 text-center max-w-2xl w-full boxy shadow-[0_0_30px_rgba(0,240,255,0.1)] mt-8">
            <p class="text-medical-glow text-sm uppercase tracking-widest mb-4"><i data-lucide="activity" class="inline w-5 h-5 mr-2"></i> Diagnosis Complete</p>
            <h1 class="font-display text-4xl md:text-5xl font-light text-white mb-8">It is most probably <br/><span class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-medical-glow to-blue-400">${data}</span></h1>
            <a href="/" class="inline-block px-8 py-3 rounded-full border border-white text-white hover:bg-white hover:text-black transition-all font-medium tracking-wide">START OVER</a>
        </div>
    `);
    lucide.createIcons();
}

function RecieveFunc(data){
    $("#cards").empty();
    $("#details").empty();
    $("#slogan-container").empty();
    sbox.classList.add("hidden");
    
    if(data.length===0){
        $("#cards").append(`
            <div class="bg-medical-panel border border-red-500/30 rounded-2xl p-8 text-center max-w-md w-full boxy mt-8">
                <h5 class="font-display text-xl text-white">No medication detected</h5>
                <a href="/" class="mt-6 inline-block px-6 py-2 rounded-full border border-white text-white hover:bg-white hover:text-black transition-all">Go Back</a>
            </div>
        `);
    } else {
        $("#details").append(`
            <h3 class="font-display text-3xl font-light text-white mb-6">Extracted Medical Regimen</h3>
            <a href="/" class="mb-12 inline-block px-6 py-2 rounded-full border border-white/20 text-white/70 hover:bg-white hover:text-black transition-all text-sm">UPLOAD ANOTHER</a>
        `);
        
        $("#cards").append(`
            <div class="bg-medical-panel backdrop-blur-xl border border-medical-border/50 rounded-xl p-6 w-full md:w-[calc(50%-12px)] boxy flex flex-col items-center">
                <div class="w-12 h-12 rounded-full bg-medical-glow/10 flex items-center justify-center border border-medical-glow/30 mb-4">
                    <i data-lucide="pill" class="text-medical-glow"></i>
                </div>
                <h5 class="font-display text-lg text-white mb-2">Aspirin</h5>
                <p class="text-gray-400 text-sm mb-6 text-center">Duration: 7 days</p>
                <button class="w-full py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white transition-all text-sm" onclick="this.innerHTML='Marked Read'">MARK AS READ</button>
            </div>
        `);
        $("#cards").append(`
            <div class="bg-medical-panel backdrop-blur-xl border border-medical-border/50 rounded-xl p-6 w-full md:w-[calc(50%-12px)] boxy flex flex-col items-center">
                <div class="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center border border-blue-400/30 mb-4">
                    <i data-lucide="pill" class="text-blue-400"></i>
                </div>
                <h5 class="font-display text-lg text-white mb-2">Advil</h5>
                <p class="text-gray-400 text-sm mb-6 text-center">Duration: 3 days</p>
                <button class="w-full py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white transition-all text-sm" onclick="this.innerHTML='Marked Read'">MARK AS READ</button>
            </div>
        `);

        $("#cards").append(`
            <div class="w-full bg-gradient-to-r from-blue-900/30 to-medical-panel backdrop-blur-xl border border-blue-400/30 rounded-xl p-8 mt-4 boxy flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h3 class="font-display text-2xl text-white mb-2">Synchronize with Google Calendar</h3>
                    <p class="text-gray-400 text-sm max-w-sm">Automatically configure reminders for your medication schedule so you never miss a dose.</p>
                </div>
                <button class="mt-6 md:mt-0 px-8 py-4 rounded-xl bg-blue-500 text-white font-semibold tracking-wider hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all flex items-center gap-3">
                    <i data-lucide="calendar" class="w-5 h-5"></i>
                    SYNC SCHEDULE
                </button>
            </div>
        `);
        lucide.createIcons();
    }
}

// Google Scripts
var CLIENT_ID = '686668170446-90dc678t33eiobahgan5qte8aod8nq1a.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBs9ZaCKkEMP7AdJWzDylVKFw_zJ7UzPHE';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function(error) {
        console.error(error);
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}