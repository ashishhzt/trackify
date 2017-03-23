import google from 'googleapis';
import googleAuth from 'google-auth-library';
import async from 'async';
import path from 'path';
import fs from 'fs';
import mailparser from 'mailparser'
import mailcomposer from 'mailcomposer'
const simpleParser = mailparser.simpleParser

var labels = ["INBOX", "IMPORTANT", "DRAFT", "SENT", "TRASH"]
var upload_path = path.join(__dirname, '../../resume_files');
const gmail = google.gmail('v1');
// Temporary data, This must come from auth module.
var credentials = { "web": { "client_id": "907704178698-cahcjcicbnkspv5m70qksticpbc5lp1v.apps.googleusercontent.com", "project_id": "tidy-jetty-160504", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://accounts.google.com/o/oauth2/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_secret": "d5ziyoDZPkifltaOIRwfBNwV", "redirect_uris": ["http://tarunsoni.com", "http://localhost.com"], "javascript_origins": ["http://tarunsoni.com", "http://localhost.com"] } }
var access_token = { "access_token": "ya29.GlsLBGmgC1atH-DNkqgAEd-v0XwZsI_xPkixA0Ec3omLM0zeQ_LTk-pGfj_f721xmfD7Te6kH8GzL-qx0l-4MI31mRSZ7hEnhvGrJ2cQLcPyUMOJMZH9vXvuY3y-", "refresh_token": "1/A_i-oOHiKV3rg3YL1ztHzykpSZp2xtL32qQuawcEbH2Zk97WkV9vev-w7n0acwGS", "token_type": "Bearer", "expiry_date": 1489207054167 }
    // var access_token = {"access_token":"ya29.GlsGBO5xVLJm4ZrpKksJIR86HQK8vX_mSKNRW8fMmBGVncVoLsloz9idAumW1M6G181NBg5LYh77ALXCD8tAv0J7nF7lHyphUQW7pIqVHAfWHfYd3BJiMWcp2oQh","refresh_token":"1/1qjbgZ3M_QtzdP0Fb6-LAXgQjd0tyuSNka9VT-DnPlA","token_type":"Bearer","expiry_date":1488804234044}
function authorize(callback) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.credentials = access_token;
    callback(oauth2Client);
}


export const fetchMessages = function(request, callback) {

    async.waterfall([authorizeUser, listMails, readMails], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback(response);
        }
    });

    function authorizeUser(callback) {
        console.log("authorize")
        authorize(function(auth) {
            console.log("got the authorized")
            callback(null, auth);
        })
    }

    function listMails(auth, callback) {
        console.log("gonna read inbox.")
        var params = {
            auth: auth,
            userId: 'me',
            labelIds: request.label,
            maxResults: 20
        }
        if (request.token) {
            params.pageToken = request.token;
        }
        // -from:flipkart.com -from:myntra.com -from:magicbricks.com -from:github.com -from:olacabs.com 
        if (request.label == "candidate") {
            params.labelIds = "INBOX"
            params.q = "-from:flipkart.com -from:myntra.com -from:olacabs.com"
        }
        if (request.label == "client") {
            params.labelIds = "INBOX"
            params.q = "{from:google.com}"
        }
        if (request.label == "search") {
            delete params.labelIds;
            params.q = request.query
        }
        gmail.users.messages.list(params, function(err, response) {
            if (err) {
                callback(err);
            } else {
                console.log(response.nextPageToken);
                callback(null, auth, response);
            }
        });
    }

    function readMails(auth, response, callback) {
        var messages = [];
        async.each(response.messages, function iterate(message, next) {
            gmail.users.messages.get({
                auth: auth,
                userId: 'me',
                format: "metadata",
                id: message.id,
                metadataHeaders: ['From', 'Subject', 'Date', 'To', 'Content-Type', 'Message-ID']
            }, function(err, response) {
                if (err) {
                    next({ status: 500, msg: "Error retriving messages." })
                } else {
                    var _message = { id: message.id, threadId: message.threadId, hasAttachment: false, isStarred: false, isRead: true };
                    if (response.labelIds.indexOf("STARRED") != -1) {
                        _message.isStarred = true;
                    }
                    if (response.labelIds.indexOf("UNREAD") != -1) {
                        _message.isRead = false;
                    }
                    for (var header of response.payload.headers) {
                        if (header.name == "Content-Type" && header.value.indexOf("multipart/mixed") != -1) {
                            _message.hasAttachment = true;
                        } else {
                            _message[header.name.toLowerCase()] = header.value;
                        }
                    }
                    _message.snippet = response.snippet.substr(0, 25)
                    messages.push(_message)
                    next();
                }
            });
        }, function done(err) {
            callback(null, { status: 200, messages: messages, nextPageToken: response.nextPageToken });
        })
    }
}

export const sendMessage = function(request, callback) {
    async.waterfall([authorizeUser, createMessage, _sendMessage], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200 });
        }
    });

    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function createMessage(data, callback) {
        console.log("creat mimeMessage");
        createMimeMessage_(request, function(msg) {
            data.mimeMessage = msg;
            callback(null, data)
        });

    }

    function _sendMessage(data, callback) {
        var params = {
            auth: data.auth,
            userId: 'me',
            resource: {
                raw: data.mimeMessage
            }
        }
        if (request.threadId) {
            params.resource.threadId = request.threadId;
        }
        // console.log(params);
        gmail.users.messages.send(params, function(error, response) {
            if (error) {
                console.log(error);
                callback({ status: 500 });
            } else {
                console.log(response);
                callback();
            }
        });
    }
}

export const readMessage = function(request, callback) {
    async.waterfall([authorizeUser, _readMessage, markRead], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200, msg: response });
        }
    });

    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function _readMessage(data, callback) {
        gmail.users.messages.get({
            auth: data.auth,
            userId: 'me',
            id: request.params.id,
            format: 'full'
        }, function(error, response) {
            if (error) {
                callback({ status: 500 });
            } else {
                console.log(JSON.stringify(response))
                data.mail = {}
                response = parseResponse(response);
                data.mail.html = response.html;
                data.mail.attachments = response.attachments;
                callback(null, data);
                // simpleParser(new Buffer(response.raw, 'base64').toString(), (err, mail) => {
                //     for (var i = mail.attachments.length - 1; i >= 0; i--) {
                //         delete mail.attachments[i].content;
                //     }
                //     data.mail = mail;
                //     callback(null, data)
                // })
            }
        });
    }

    function markRead(data, callback) {
        gmail.users.messages.modify({
            auth: data.auth,
            userId: 'me',
            id: request.params.id,
            resource: { removeLabelIds: ["UNREAD"] }
        }, function(error, response) {
            callback(null, data.mail);
        });
    }
}

export const modifyLabel = function(req, callback) {
    console.log(req);
    async.waterfall([authorizeUser, updateMessage], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200, msg: response });
        }
    });


    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function updateMessage(data, callback) {
        async.each(req.id, function iterator(id, callback) {
            var params = {
                auth: data.auth,
                userId: 'me',
                id: id,
                resource: {}
            }
            if (req.addLabels && req.addLabels.length > 0) {
                params.resource.addLabelIds = req.addLabels
            }
            if (req.removeLabels && req.removeLabels.length > 0) {
                params.resource.removeLabelIds = req.removeLabels
            }
            console.log(params)
            gmail.users.messages.modify(params, function(error, response) {
                callback();
            });
        }, function done(error) {
            if (error) {
                console.log(error);
                callback({ status: 500 });
            } else {
                callback(null, { status: 200 });
            }
        });

    }
}

export const deleteMessage = function(request, callback) {
    async.waterfall([authorizeUser, trashMessage], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200, msg: response, id: request.params.id });
        }
    });


    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function trashMessage(data, callback) {
        gmail.users.messages.trash({
            auth: data.auth,
            userId: 'me',
            id: request.params.id
        }, function(error, response) {
            if (error) {
                console.log(error);
                callback({ status: 500 });
            } else {
                callback(null, { status: 200 });
            }
        });
    }
}

export const restoreMessage = function(request, callback) {
    async.waterfall([authorizeUser, untrashMessage], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200, msg: response });
        }
    });


    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function untrashMessage(data, callback) {
        gmail.users.messages.untrash({
            auth: data.auth,
            userId: 'me',
            id: request.params.id
        }, function(error, response) {
            if (error) {
                console.log(error);
                callback({ status: 500 });
            } else {
                callback(null, { status: 200 });
            }
        });
    }
}

export const fetchCount = function(requset, callback) {
    async.waterfall([authorizeUser, _fetchCount], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200, data: response });
        }
    });

    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function _fetchCount(data, callback) {
        var counter = {}
        async.each(labels, function iterator(label, callback) {
            gmail.users.labels.get({
                auth: data.auth,
                userId: 'me',
                id: label
            }, function(error, response) {
                counter[label] = response;
                callback()
            });
        }, function done() {
            callback(null, counter)
        });
    }
}

export const download=(request, callback)=>{
    async.waterfall([authorizeUser, _download], function(error, response) {
        if (error) {
            callback(error);
        } else {
            callback({ status: 200, data: response });
        }
    });

    function authorizeUser(callback) {
        authorize(function(auth) {
            callback(null, { auth: auth });
        })
    }

    function _download(data, callback){
        gmail.users.messages.attachments.get({
            auth: data.auth,
            userId: 'me',
            id: request.attachmentId,
            messageId: request.messageId,
        }, function(error, response) {
            console.log(error);
            console.log(response);
            callback(response);
        });
    }
}

function createMimeMessage_(msg, callback) {
    let mailOptions = {
        from: msg.mailFrom,
        to: msg.mailTo,
        subject: msg.subject,
        sender: msg.mailFrom,
        html: msg.body
    }
    if (msg.messageId) {
        mailOptions.inReplyTo = msg.messageId;
    }
    if (msg.cc) {
        mailOptions.cc = msg.cc;
    }
    if (msg.bcc) {
        mailOptions.bcc = msg.bcc;
    }
    console.log(msg)
    mailOptions.attachments = []
    if (msg.attachments) {
        for (var i = msg.attachments.length - 1; i >= 0; i--) {
            mailOptions.attachments.push({ filename: msg.attachments[i].originalFileName, path: upload_path + "\\" + msg.attachments[i].fileName })
        }
    }
    var mail = mailcomposer(mailOptions);
    mail.build(function(err, message) {
        var raw = message.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        callback(raw);
    });
}

function base64Encode(msg) {
    console.log(msg);
    return new Buffer(msg).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseResponse(response) {
    var data = {html: '', attachments:[]};
    // In e.g. a plain text message, the payload is the only part.
    var attachments = response.payload.parts;
    if(attachments){
        for (var i = 0; i < attachments.length; i++) {
            var part = attachments[i];
            if (part.filename && part.filename.length > 0) {
                data.attachments.push({filename:part.filename, id: part.body.attachmentId, size:part.body.size, mimeType:part.mimeType})
            }
        }
    }

    var parts = [response.payload];
    while (parts.length) {
        var part = parts.shift();
        if (part.parts) {
            parts = parts.concat(part.parts);
        }
        if (part.mimeType === 'text/plain' && part.body.data) {
            // Continue to look for a 'text/html' part.
            data.html = decode(part.body.data);
        } else if (part.mimeType === 'text/html' && part.body.data) {
            // 'text/html' part found. No need to continue.
            data.html = decode(part.body.data);
            break;
        }
    }

    return data;
}


function decode(string) {
    console.log(string);
    return decodeURIComponent(escape(string.replace(/\-/g, '+').replace(/\_/g, '/'))).toString("utf8");
}
