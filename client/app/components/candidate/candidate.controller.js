const SERVICE = new WeakMap();

class CandidateController {
    constructor($state, AuthFactory, candidateService, shareData, mailer) {
        this.AuthFactory = AuthFactory;
        let userObj = AuthFactory.getLoggedInUser();
        this.userId = userObj.user._id;
        this.idSkip = 0;
        this.checkIDCandidateList = [];
        this.flagCheckAllIDCandidate = false;
        this.sideMenuState = { flag: "myjob", status: "active" };
        this.$state = $state;
        this.shareData = shareData;
        this.mailer = mailer;

        SERVICE.set(this, candidateService);
    }

    checkAllIDCandidate() {
        this.checkIDCandidateList = [];
        for (let i = 0; i < this.allCandidateDetails.length; i++) {
            this.checkIDCandidateList.push(this.flagCheckAllIDCandidate);
        }
    }
    getSelectedIDCandidates() {
        this.checkedIDCandidateNum = 0;
        this.selectedIDCandidateIdArr = [];
        let leng = this.allCandidateDetails.length;
        for (let i = 0; i < leng; i++) {
            if (this.checkIDCandidateList[i] === true) {
                this.checkedIDCandidateNum++;
                this.selectedIDCandidateIdArr.push(this.allCandidateDetails[i]._id);
            }
        }
        if (this.checkedIDCandidateNum === 0) {
            alert("Please select atleast one candidate from the list");
        }
    }
    uploadResume(candidateId) {

        var file = this.resumeFile;
        if (file) {
            var fd = new FormData();
            fd.append('resumeFile', file);
            fd.append('candidateId', candidateId);
            fd.append('uploadDate', new Date());

            SERVICE.get(this).uploadResumeFile(fd).then(response => {
                console.log(response.message);
                if (response.message == "ERROR")
                    alert("Error occurred while uploading resume file.\nPlease select proper file type and size.");
                else if (response.message === 'UPDATE SUCCESS')
                    alert(`Resume successfully updated.`)
                this.resumeFile = null;
                document.getElementById("new-file-input2").value = "";
            }, error => {
                console.log(error);
            });
        } else {
            alert("Please select a file to upload!");
            document.getElementById("new-file-input2").value = "";
        }

    };
    saveIDCandidateDetails(candidateId) {

        if (document.getElementById("editreadonly_hidden").value == 0) {
            if ((this.iDataCandidateDetails.candidateEmail.indexOf("@") == -1) || (this.iDataCandidateDetails.candidateEmail.indexOf(".") == -1) || (this.iDataCandidateDetails.candidateEmail.lastIndexOf(".") < this.iDataCandidateDetails.candidateEmail.indexOf("@")) || (this.iDataCandidateDetails.candidateEmail.indexOf("@") != this.iDataCandidateDetails.candidateEmail.lastIndexOf("@"))) {
                alert("Please enter valid email address!");

                $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                $("#detailform :input").prop("disabled", false);
                $("#editreadonly_hidden").val(1);
            } else if (this.iDataCandidateDetails.candidateContact.length != 10) {
                alert("Please enter 10 digit contact number");

                $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                $("#detailform :input").prop("disabled", false);
                $("#editreadonly_hidden").val(1);
            } else if ((this.iDataCandidateDetails.candidateName != null) && (this.iDataCandidateDetails.candidateEmail != null) && (this.iDataCandidateDetails.experience != null) && (this.iDataCandidateDetails.ctcFixed != null) && (this.iDataCandidateDetails.ctcVariable != null) && (this.iDataCandidateDetails.ctcEsops != null) && (this.iDataCandidateDetails.eCTCFixed != null) && (this.iDataCandidateDetails.eCTCVariable != null) && (this.iDataCandidateDetails.eCTCEsops != null) && (this.iDataCandidateDetails.location != null)) {

                let reqObject = Object.assign(this.iDataCandidateDetails);
                reqObject.candidateId = candidateId;

                SERVICE.get(this).saveCandidateDetails(reqObject).then(response => {
                    console.log(response.message);
                }, error => {
                    console.log(error);
                });
            } else {
                alert("Please enter required fields");
            }
        }
    };
    sendMessage(jobId, candidateId) {
        var reqData = {
            "jobId": jobId,
            "userId": this.userId,
            "candidateId": candidateId,
            "timestamp": new Date(),
            "message": this.postMessage
        };

        SERVICE.get(this).sendMessage(reqData).then(response => {
            this.postMessage = "";
            this.getFeedMsgThread(jobId, candidateId);
        }, error => {
            this.postMessage = "";
        });
    }
    getFeedMsgThread(jobId, candidateId) {
        this.feedMsgRecords = {};
        SERVICE.get(this).feedMsgThreadData(jobId, candidateId).then(response => {
            for (let i in response.TAGS) {
                response.TAGS[i].sentTo = (response.TAGS[i].sentTo).split(",").join(" @");
            }
            this.feedMsgRecords = response;
        }, error => {
            console.log(error);
        });
    }
    internalDataCandidateDetailsFunction(candidateId) {

        SERVICE.get(this).getLinkedInLink(candidateId).then(response => {
            this.iDataLinkedInLink = response.linkedinLink;
        }, error => {
            console.log(error);
        });

        SERVICE.get(this).getResumeMetadata(candidateId).then(response => {
            this.iDataResumeFileMetadata = response;
        }, error => {
            console.log(error);
        });

        SERVICE.get(this).getCandidateDetails(candidateId).then(response => {
            this.iDataCandidateDetails = response;

        }, error => {
            console.log(error);
        });

        SERVICE.get(this).feedJobData(candidateId).then(response => {
            this.iDataFeedJobRecords = response;
        }, error => {
            console.log(error);
        });

    };
    getJobsDetail(userId, flag, status) {
        this.sideMenuState = { flag: flag, status: status };

        SERVICE.get(this).getJobsDetail(userId, flag, status).then(response => {
            this.sideMenuJobsDetails = response.data.reverse();
        }, error => {
            console.log(error);
        });
        if (this.searchColJobText) this.searchColJobText.clientName = "";
        SERVICE.get(this).getAllInternalDataCandidateList(this.idSkip).then(response => {
            this.allCandidateDetails = response.data;
            this.allCandidateCount = response.count;
            // Check candidate functionality
            this.flagCheckAllIDCandidate = false;
            this.checkIDCandidateList = [];
            for (let i = 0; i < this.allCandidateDetails.length; i++) {
                this.checkIDCandidateList.push(false);
            }
            //Get candidate Details section data
            if (this.allCandidateDetails.length > 0) {
                this.internalDataCandidateDetailsFunction(this.allCandidateDetails[0]._id);
            }
        }, error => {
            console.log(error);
        });
    };
    skipRecall(evt) {
        if (evt == '+' && (this.idSkip + 50) <= allCandidateCount) {
            this.idSkip = this.idSkip + 50;
            this.getJobsDetail(this.userId, this.sideMenuState.flag, this.sideMenuState.status);
        }
        if (evt == '-' && (this.idSkip - 50) >= 0) {
            this.idSkip = this.idSkip - 50;
            this.getJobsDetail(this.userId, this.sideMenuState.flag, this.sideMenuState.status);
        }
    }
    initJobs() {
        $("#detailform :input").prop("disabled", true);
        this.getJobsDetail(this.userId, this.sideMenuState.flag, this.sideMenuState.status);
    };
    navToJobModule(jobId) {
        let temp = {
            "jobId": jobId,
            "flag": this.sideMenuState.flag,
            "status": this.sideMenuState.status
        };
        this.shareData.setProperty(temp);
        this.$state.go('jobs');
    }
    fetchMails(label) {
        this.inbox[label] = []
        $('.inboxtable').show();
        $('.openinbox').hide();
        if (!this.inbox.currentView) {
            $("#mailslide").toggle("slide");
        } else if (label != "search" && this.inbox.currentView == label) {
            // Same li is clicked twice, hide the menu
            $("#mailslide").toggle("slide");
            this.inbox.currentView = undefined;
            return;
        }
        this.inbox.currentView = label;
        SERVICE.get(this).fetchMails({ label: label, query: this.searchText }).then(response => {
            this.inbox[label] = [];
            console.log(this.inbox);
            // this.inbox.paginate[label].tokens = [undefined];
            // }
            console.log(response);
            this.inbox.nextPageToken = response.nextPageToken
            this.inbox.fromCount = 1;
            this.inbox.toCount = response.threads.length;
            this.inbox[label] = response.threads;
            // this.inbox[label] = this.inbox[label].concat(response.messages);
            console.log(this.inbox);
        }, error => {
            console.log(error);
        });
    }

    composeMail(message) {
        console.log(message);
        var attachments = this.mailAttachments;
        if (!attachments) {
            attachments = [];
        }
        var processedAttachments = [];
        if (attachments.length != 0) {
            for (var i = attachments.length - 1; i >= 0; i--) {
                var formData = new FormData();
                formData.append('resumeFile', attachments[i], attachments[i].name);
                console.log(formData);
                console.log(attachments[i]);
                SERVICE.get(this).uploadAttachment(formData).then(response => {
                    processedAttachments.push(response);
                    if (processedAttachments.length == attachments.length) {
                        var params = {};
                        params.attachments = processedAttachments;
                        params.mailTo = this.email.to;
                        params.mailFrom = 'tarun1188@gmail.com';
                        params.body = $('#mailtextarea').code();
                        params.subject = this.email.subject;
                        if (this.email.cc) {
                            params.cc = this.email.cc;
                        }
                        if (this.email.bcc) {
                            params.bcc = this.email.bcc;
                        }
                        if (message) {
                            params.subject = message.subject;
                            params.threadId = message.threadId;
                            params.messageId = message['message-id'];
                            params.body = $("#summernote1").code()
                        }
                        console.log(params);
                        for (var key in params) {
                            if (!params[key]) {
                                alert("Missing " + key);
                                return;
                            }
                        }
                        SERVICE.get(this).composeMail(params).then(response => {
                            console.log(response);
                            $('.action-close').trigger("click");
                            alert("mail sent successfully");
                        }, error => {
                            console.log(error);
                        });
                    }
                }, error => {
                    console.log(error);
                });
            }
        } else {
            var params = {};
            if (this.email.cc) {
                params.cc = this.email.cc;
            }
            if (this.email.bcc) {
                params.bcc = this.email.bcc;
            }
            params.mailFrom = 'tarun1188@gmail.com';
            if (message) {
                params.subject = message.subject;
                params.threadId = message.threadId;
                params.mailTo = message.from;
                params.messageId = message['message-id'];
                params.body = $("#summernote1").code();
            } else {
                params.subject = this.email.subject;
                params.mailTo = this.email.to;
                params.body = $('#mailtextarea').code();
            }
            console.log(params);
            for (var key in params) {
                if (!params[key]) {
                    alert("Missing " + key);
                    return;
                }
            }
            SERVICE.get(this).composeMail(params).then(response => {
                alert("mail sent successfully");
                console.log(response);
                $("#summernote1").code("");
                $('#mailtextarea').code("");
                $('.note-editor').toggle();
            }, error => {
                console.log(error);
            });
        }

    }

    handleAttachments() {
        console.log(this.mailAttachments)
            // console.log(this.email.attachments);
        console.log("we are handling attachments")
    }

    popuplateTemplate() {
        $('#mailtextarea').code("");
        $('#mailtextarea').summernote('editor.insertText', this.email.template);
    }

    predictEmail() {
        console.log("predict ! predict !! predict !!!")
    }

    fetchMailCount(view) {
        SERVICE.get(this).fetchMailCount().then(response => {
            if (view == "main") {
                this.inbox.counter = response.data;
                // this.inbox.inboxCounter = response.data.INBOX.messagesUnread;
                // this.inbox.draftsCounter = response.data.DRAFT.messagesTotal;
                // this.inbox.totalCounter = response.data.INBOX.messagesTotal;
            } else {
                this.mailForJobs.inboxCounter = response.data.INBOX.messagesUnread;
                this.mailForJobs.draftsCounter = response.data.DRAFT.messagesTotal;
                this.mailForJobs.totalCounter = response.data.INBOX.messagesTotal;
            }

        }, error => {
            console.log(error);
        });
    }

    modifyEmail(label, message) {
        if (label == "STARRED") {
            SERVICE.get(this).modifyEmail([message.id], !message.isStarred, "STARRED").then(response => {
                alert("Message updated.");
                message.isStarred = !message.isStarred;
            }, error => {
                console.log(error);
            });
        } else {
            var idList = [];
            $('.mail-checkbox').each(function() {
                if (this.id && this.checked) { idList.push(this.id) }
            });
            SERVICE.get(this).modifyEmail(idList, label == "UNREAD" ? false : true, label).then(response => {
                alert("Message updated.")
                for (var k = idList.length - 1; k >= 0; k--) {
                    for (var i = this.inbox[label].length - 1; i >= 0; i--) {
                        if (label == "TRASH" && this.inbox[this.inbox.currentView][i].id == idList[k]) {
                            this.inbox[this.inbox.currentView].splice(i, 1);
                        }
                        if (label == "SPAM" && this.inbox[this.inbox.currentView][i].id == idList[k]) {
                            this.inbox[this.inbox.currentView].splice(i, 1);
                        }
                        if (label == "UNREAD" && this.inbox[this.inbox.currentView][i].id == idList[k]) {
                            this.inbox[this.inbox.currentView][i].isRead = true;
                        }
                    }
                }
            }, error => {
                console.log(error);
            });
        }
    }

    fetchNext(action) {
        console.log(action);
        var label = this.inbox.currentView;
        if (action == "NEXT") {
            if (!this.inbox.nextPageToken) {
                alert("reached end.");
                return;
            }
            this.inbox.previousPageToken = this.inbox.nextPageToken;
            var token = this.inbox.nextPageToken;
        } else {
            if (this.inbox.previousPageToken) {
                return;
            }
            var token = this.inbox.previousPageToken;
        }
        SERVICE.get(this).fetchMails({
            label: label,
            query: this.searchText,
            token: token
        }).then(response => {
            this.inbox[label] = response.threads;
            this.inbox.fromCount = this.inbox.toCount + 1;
            this.inbox.toCount = this.inbox.toCount + response.threads.length;
            this.inbox.nextPageToken = response.nextPageToken;
            console.log(this.inbox);
        }, error => {
            console.log(error);
        });
    }

    readMail(view, message) {
        if (view == "main") {
            this.inbox.thread = [];
            this.inbox.message = message;
            $('.openinbox').show();
            $('.inboxtable').hide();
            SERVICE.get(this).readMail(message).then(response => {
                this.inbox.thread = response.msg;
                for (var i = this.inbox.thread.length - 1; i >= 0; i--) {
                    this.inbox.thread[i].html = atob(this.inbox.thread[i].html);
                    $("#" + this.inbox.thread[i].messageId + " > .panel-body").html(this.inbox.thread[i].html)
                }
                // console.log(this.inbox.thread);
                // var _response = response.
                // if (this.inbox.currentView == "INBOX" && !this.inbox.thread[0].isRead) {
                //     this.inbox.counter.INBOX.messagesUnread -= 1;
                // }
                // this.inbox.message.attachments = response.msg.attachments;
                // console.log(response);
                // $('.email-body').html(atob(response.msg.html));
                // this.email.content = response.msg.html;
            }, error => {
                console.log(error);
            });
        } else {
            this.mailForJobs.message = message;
            $('.openinbox').show();
            $('.inboxtable').hide();
            SERVICE.get(this).readMail(message).then(response => {
                var response = response.msg[response.msg.length - 1];
                if (this.mailForJobs.currentView == "INBOX" && !message.isRead) {
                    this.mailForJobs.inboxCounter -= 1;
                }
                this.mailForJobs.message.attachments = response.attachments;
                this.mailForJobs.message.html = atob(response.html);
                // this.email.content = response.msg.html;
            }, error => {
                console.log(error);
            });
        }
    }

    sendMailForJob(data) {
        let candidateDetails = [];
        for (var i = this.allCandidateDetail[this.presentStage].length - 1; i >= 0; i--) {
            if (this.checkedCandidateList[i]) {
                let candidate = this.allCandidateDetail[this.presentStage][i];
                candidateDetails.push({ id: candidate.id, email_id: candidate.email_id, hashFileName: candidate.hashFileName, originalFileName: candidate.originalFileName, mimetype: candidate.mimetype });
            }
        }
        SERVICE.get(this).sendMailForJob(candidateDetails).then(response => {
            alert("resumes sent successfully");
        }, error => {
            console.log(error);
        });
    }

    removeAttachment(index) {
        this.mailAttachments.splice(index, 1);
    }
    fetchMailsForJob(label) {
        $('.openinbox').hide();
        $('.inboxtable').show();
        this.mailForJobs.currentView = label;
        // "subject:"+this.selectedJobDetail.clientName
        SERVICE.get(this).fetchMails({ label: label, query: "subject:" + this.selectedJobDetail.clientName }).then(response => {
            this.mailForJobs[label] = [];
            this.mailForJobs[label] = response.threads;
            console.log(this.mailForJobs[label]);
        }, error => {
            console.log(error);
        });
    }
    downloadAttachment(attachment) {
        console.log(attachment);
        SERVICE.get(this).downloadAttachment({ messageId: this.inbox.message.id, attachmentId: attachment.id, filename: attachment.filename, mimeType: attachment }).then(response => {
            // var blobFile = new window.Blob([atob(response.data)]);
            var link = 'data:' + response.mimeType + ';base64,' + response.data.replace(/-/g, '+').replace(/_/g, '/');
            var a = document.createElement('a');
            a.download = response.filename;
            a.setAttribute('href', link);
            document.body.appendChild(a);
            a.click();
            // inline.append('<a href="' + link + '" style="display: block">' + filename + '</a>');
            // console.log(response);
        }, error => {
            console.log(error);
        });

    }

    saveClientTemplate(event) {
        console.log(event)
        if (event.currentTarget.className.indexOf("save-template") != -1) {
            if (this.clientTemplate.client) {
                var client = JSON.parse(this.clientTemplate.client);
                var requestBody = {
                    type: "client",
                    clientName: client.clientName,
                    clientId: client._id,
                    templateName: this.clientTemplate.templateName,
                    templateText: this.clientTemplate.templateText
                }
            } else {
                requestBody = this.clientTemplate;
            }
            SERVICE.get(this).saveTemplate(requestBody).then(response => {
                alert("template saved")
            });
        }
    }

    saveCandidateTemplate(event) {
        console.log(event)
        var requestBody = {};
        if (event.currentTarget.className.indexOf("save-template") != -1) {
            if (this.candidateTemplate.client) {
                var client = JSON.parse(this.candidateTemplate.client);
                requestBody = {
                    type: "candidate",
                    clientName: client.clientName,
                    clientId: client._id,
                    templateName: this.candidateTemplate.templateName,
                    templateText: this.candidateTemplate.templateText
                }
            } else {
                requestBody = this.candidateTemplate;
            }
            SERVICE.get(this).saveTemplate(requestBody).then(response => {
                alert("template saved")
                this.templates.push(requestBody);
            });
        }
    }

    fetchTemplates(type) {
        this.candidateTemplate = {};
        this.clientTemplate = {};
        SERVICE.get(this).fetchTemplates({ type: type }).then(response => {
            this.templates = response.templates;
            console.log(response);
        });
    }
}

CandidateController.$inject = ['$state', 'AuthFactory', 'candidateService', 'shareData', 'mailer']

export default CandidateController;
