import { Signer } from '@waves/signer';
import { libs } from '@waves/waves-transactions';
import { ProviderSeed } from '@waves/provider-seed';
var QRCode = require('qrcode');
import $ from "jquery";
import "regenerator-runtime/runtime.js";
import Cookies from "js-cookie";
class Wallet {
    constructor() {
        this.address = Cookies.get("address");
        this.seed = Cookies.get("seed");
        this.sessionSeed = Cookies.get("sessionSeed");
    }
    getPage() {
        if (this.isLoggedIn()) {
            this.populateData();
            return "main";
        }
        else {
            if (this.accountExists()) {
                return "login";
            }
            else {
                return "newaccount";
            }
        }
    }
    async register() {
        if (passwordsEqual("password2", "password3", "pMessage1")) {
            var seed = libs.crypto.randomSeed();
            await this.initWaves(seed);
            var p = $("#password2").val();
            this.encryptSeed(seed, p);
            this.setCookies();
            this.populateData();
            this.showHomeAfterRegister();
        }
    }
    async import() {
        if (passwordsEqual("password4", "password5", "pMessage2")) {
            var seed = $("#seedWords1").val();
            if (seed) {
                await this.initWaves(seed);
                var p = $("#password4").val();
                this.encryptSeed(seed, p);
                this.setCookies();
                this.populateData();
                this.showHomeAfterRegister();
            }
            else {
                $("#pMessage2").html("Seed riječi su obavezne.");
                $("#pMessage2").fadeIn();
            }
        }
    }
    async initWaves(seed) {
        this.signer = new Signer();
        this.provider = new ProviderSeed(seed);
        this.signer.setProvider(this.provider);
        this.user = await this.signer.login();
        this.address = this.user.address;
    }
    encryptSeed(seed, password) {
        this.seed = libs.crypto.encryptSeed(String(seed), String(password));
        this.sessionSeed = libs.crypto.encryptSeed(String(seed), this.address);
    }
    decryptSeedSession() {
        var seed = libs.crypto.decryptSeed(this.sessionSeed, this.address);
        return seed;
    }
    setCookies() {
        Cookies.set("address", this.address);
        Cookies.set("seed", this.seed);
        Cookies.set("sessionSeed", this.sessionSeed);
    }
    async populateData() {
        $("#address").val(this.address);
        this.generateQR();
        if (!this.signer) {
            var seed = this.decryptSeedSession();
            await this.initWaves(seed);
        }
        this.populateBalance();
    }
    async populateBalance() {
        var balances = await this.signer.getBalance();
        balances.forEach(function (asset) {
            if (asset.assetId == AHRK) {
                var balance = asset.amount / AHRKDEC;
                balance = Math.round(balance * 100) / 100;
                $("#balance").html(String(balance));
            }
        });
    }
    accountExists() {
        if (this.seed) {
            return true;
        }
        else {
            return false;
        }
    }
    isLoggedIn() {
        if (this.sessionSeed) {
            return true;
        }
        else {
            return false;
        }
    }
    generateQR() {
        QRCode.toString(this.address, function (error, qr) {
            if (error)
                console.error(error);
            $('#qrcode').replaceWith($('<div/>').append(qr).find('svg:first').attr('id', 'qrcode'));
            $('#qrcode').attr('class', 'qrcode border border-dark');
        });
    }
    showHomeAfterRegister() {
        activeScreen = "home";
        $("#page-newaccount").fadeOut(function () {
            $("#page-main").fadeIn();
        });
    }
}
var wallet = new Wallet();
var activeScreen = "home";
const AHRK = "Gvs59WEEXVAQiRZwisUosG7fVNr8vnzS8mjkgqotrERT";
const AHRKDEC = 1000000;
// Button bindings
$("#receive").on("click", function () {
    activeScreen = "receive";
    $("#screen-home").fadeOut(function () {
        $("#screen-receive").fadeIn();
    });
});
$("#backFromReceive").on("click", function () {
    activeScreen = "home";
    $("#screen-receive").fadeOut(function () {
        $("#screen-home").fadeIn();
    });
});
$("#send").on("click", function () {
    activeScreen = "send";
    $("#screen-home").fadeOut(function () {
        $("#screen-send").fadeIn();
    });
});
$("#backFromSend").on("click", function () {
    activeScreen = "home";
    $("#screen-send").fadeOut(function () {
        $("#screen-home").fadeIn();
    });
});
$("#cards").on("click", function () {
    activeScreen = "cards";
    $("#screen-home").fadeOut(function () {
        $("#screen-cards").fadeIn();
    });
});
$("#backFromCards").on("click", function () {
    activeScreen = "home";
    $("#screen-cards").fadeOut(function () {
        $("#screen-home").fadeIn();
    });
});
$("#settings").on("click", function () {
    if (activeScreen != "home") {
        $("#screen-" + activeScreen).fadeOut(function () {
            $("#screen-settings").fadeIn();
            activeScreen = "settings";
        });
    }
    else {
        activeScreen = "settings";
        $("#screen-home").fadeOut(function () {
            $("#screen-settings").fadeIn();
        });
    }
});
$("#backFromSettings").on("click", function () {
    activeScreen = "home";
    $("#screen-settings").fadeOut(function () {
        $("#screen-home").fadeIn();
    });
});
$("#buttonShowExisting").on("click", function () {
    $("#newAccount").fadeOut(function () {
        $("#existingAccount").fadeIn();
    });
});
$("#buttonNewAccount").on("click", function () {
    $("#existingAccount").fadeOut(function () {
        $("#newAccount").fadeIn();
    });
});
$("#buttonRegister").on("click", function () {
    wallet.register();
});
$("#buttonImport").on("click", function () {
    wallet.import();
});
document.addEventListener('DOMContentLoaded', (event) => {
    $("#page-loading").fadeOut(function () {
        var page = wallet.getPage();
        $("#page-" + page).fadeIn();
    });
});
// Helper functions
function passwordsEqual(p1id, p2id, mid) {
    var p1 = $("#" + p1id).val();
    var p2 = $("#" + p2id).val();
    if (!p1 || !p2) {
        $("#" + mid).html("Oba polja lozinke su obavezna.");
        $("#" + mid).fadeIn();
        return false;
    }
    if (p1 == p2) {
        return true;
    }
    else {
        $("#" + mid).html("Prva i druga lozinka se ne podudaraju.");
        $("#" + mid).fadeIn();
        return false;
    }
}
//# sourceMappingURL=app.js.map