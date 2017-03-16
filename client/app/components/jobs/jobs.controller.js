
const SERVICE = new WeakMap();
let trackFilterObjectLastApplied = [{"filterTag":"filterByRecruiter"},{"filterTag":"selectStatus"}]; //for init stage -  New Resume stage

class JobsController {
  constructor($rootScope, AuthFactory, jobsService, shareData) {
      
        this.AuthFactory = AuthFactory;
        // console.log('userObjFromService', userObjFromService);

        this.userId = 1; //get this data from localstorage

        this.shareData = shareData; //service to pass data to fro from controllers

        this.checkedAllCandidateFlag = false;
        this.sideMenuState = {flag: 'myjob', status: 'active'};
        this.presentStage = "NEW";
        this.newCandReg = {
            "name": null,
            "email": null,
            "phNum": null
        };
        this.changeStatusModel = {status: "", statusInputs: []};
        this.moveToInactiveReasons = [];
        this.interviewDateData = {"date": null, "time": null, "meridian": null, "round": 1, "rescheduleReason": null};
        this.filterObject = {"NEW": [], "SHORTLIST": [],"INTERVIEW": [], "OFFER": [], "JOINED": [], "CANDIDATE": []};
        this.abscondingReason = null;


        //Social Data - Internal data variables
        this.selectedIDCandidateIdArr = [];

        //Init for Social Data Section
        this.sdSkip = 0;
        this.sdFilterObject =
            {
                "designation" : [],
                "irrelevantSkills": [],
                "mandatorySkills": [],
                "eitherOrSkills": [],
                "minExp": 0,
                "maxExp": 60,
                "currentLocation": [],
                "education": [],
                "college": null,
                "currentCompany": null,
                "previousCompany": null,
                "withMailIds": null,
                "withoutMailsId": null,
                "patents": null,
                "publications": null
            };

        SERVICE.set(this, jobsService);
        if(shareData.getProperty() == 'blank'){
            this.initJobs();
        } else {
            this.getJobsDetail(this.userId, shareData.getProperty().flag, shareData.getProperty().status)
        }
  }

    $onInit() {
        console.log('this.user injected into job component\'s bindings by ui-router\'s $resolve service', this.user)
    }

    setStage(stage){
        this.searchKeywordJobs = "";
        this.checkedAllCandidateFlag = false;
        this.presentStage = stage;
        this.filterObject = {"NEW": [], "SHORTLIST": [],"INTERVIEW": [], "OFFER": [], "JOINED": [], "CANDIDATE": []};

        if(this.presentStage != 'INTERVIEW') {
            this.filterObject[this.presentStage] = [{"filterTag":"filterByRecruiter"},{"filterTag":"selectStatus"}];
            trackFilterObjectLastApplied = [{"filterTag":"filterByRecruiter"},{"filterTag":"selectStatus"}];
        } else {
            this.filterObject['INTERVIEW'] = [{"filterTag":"filterByRecruiter"},{"filterTag":"filterByInterviewDate"}, {"filterTag":"filterByInterviewPending"}];
            trackFilterObjectLastApplied = [{"filterTag":"filterByRecruiter"},{"filterTag":"filterByInterviewDate"}, {"filterTag":"filterByInterviewPending"}];
        }

        let leng = this.allCandidateDetail[stage].length;
        if(leng > 0)
            this.selectedCandidate = this.allCandidateDetail[stage][leng-1];
        else
            this.selectedCandidate = null;
        this.candidateDetailsForJob(this.selectedJobDetail._id);
    };

    checkAllCandidate(evt) {
        if(evt === "ALL") {
            this.checkedCandidateList = [];
            var leng = this.allCandidateDetail[this.presentStage].length;
            for(var i=0; i<leng; i++){
                this.checkedCandidateList.push(this.checkedAllCandidateFlag);
            }
        } else {
            this.checkedAllCandidateFlag = false;
        }
    };

    checkedCandidateCount() {
        this.checkedCandidateNum = 0;
        this.checkedCandidateListIds = [];
        var leng = this.allCandidateDetail[this.presentStage].length;

        let tempCandidateIdSortedArray = [];
        for(let j=0; j<leng; j++){
            tempCandidateIdSortedArray.push(this.allCandidateDetail[this.presentStage][j]._id);
        }
        tempCandidateIdSortedArray.sort(function(a, b){return b-a});

        for(var i=0; i<leng; i++){
            if(this.checkedCandidateList[i] === true) {
                this.checkedCandidateNum++;
                this.checkedCandidateListIds.push(tempCandidateIdSortedArray[i]);
            }
        }
        if(this.checkedCandidateNum === 0){
            alert("Please select atleast one candidate from the list");
        }
    }

    applyLastFilterSelection() {
        console.log(trackFilterObjectLastApplied);
        this.filterObject[this.presentStage] = JSON.parse(JSON.stringify(trackFilterObjectLastApplied));
    };

    resetModalSelectInput(id){
        document.getElementById(id).value = [];
    };

    adjustFilterObject(key, value) {
        let adjTempArray = [];
        if(this.presentStage === "NEW" || this.presentStage === "SHORTLIST" || this.presentStage === "OFFER"|| this.presentStage === "JOINED"){
            for(var obj of this.filterObject[this.presentStage]){
                if(obj.filterTag === key){
                    let tempObj = {"filterTag": key, filterValue: []};
                    for(var i=0; i<obj.filterValue.length; i++){
                        if(obj.filterValue[i] != value)
                            tempObj.filterValue.push(obj.filterValue[i]);
                    }
                    adjTempArray.push(tempObj);
                } else {
                    adjTempArray.push(obj);
                }
            }
            this.filterObject[this.presentStage] = adjTempArray;
        } else if(this.presentStage === "INTERVIEW") {
            for(var obj of this.filterObject[this.presentStage]){
                if(obj.filterTag === key){
                    if(key === 'status')
                        continue;
                    else if(key === 'filterByInterviewDate')
                        continue;
                    else {
                        let tempObj = {"filterTag": key, filterValue: []};
                        if(obj.filterValue){
                            for(var i=0; i<obj.filterValue.length; i++){
                                if(obj.filterValue[i] != value)
                                    tempObj.filterValue.push(obj.filterValue[i]);
                            }
                            adjTempArray.push(tempObj);
                        }
                    }
                } else {
                    adjTempArray.push(obj);
                }
            }
            this.filterObject[this.presentStage] = adjTempArray;
        }
        this.applyfilter()
    };

    addInterviewDate(){
        let round = (this.presentStage === "SHORTLIST") ? 1 : this.interviewDateData.round;
        let rescheduleReason = null;
        if(this.presentStage !== "SHORTLIST" && this.interviewDateData.rescheduleReason) {
            rescheduleReason = this.interviewDateData.rescheduleReason;
        }
        let reqData = {
            "jobId": this.selectedJobDetail._id,
            "candidateId": this.checkedCandidateListIds,
            "stage": this.presentStage,
            "timestamp": new Date(),
            "interview": {
                "date": this.interviewDateData.date,
                "time": this.interviewDateData.time,
                "meridian": this.interviewDateData.meridian,
                "round": round,
                "rescheduleReason": rescheduleReason
            }
        };
        SERVICE.get(this).addInterviewDate(reqData).then(response => {
            this.checkedCandidateList = [];
            this.interviewDateData = {"date": null, "time": null, "meridian": null, "round": 1, "rescheduleReason": null};
        }, error => {
            this.interviewDateData = {"date": null, "time": null, "meridian": null, "round": 1, "rescheduleReason": null};
            console.log(error);
        });
    };

    selectedCandidateDetails(candidateId) {
        for(var arrElem of this.allCandidateDetail[this.presentStage]){
            if(arrElem._id === candidateId){
                this.selectedCandidate = arrElem;
                this.candidateDetailsFunction(candidateId);
                break;
            }
        }
    };

    saveCandidateDetails(){
        if(document.getElementById("editreadonly_hidden").value == 0){
            if((this.candidateDetails.candidateEmail.indexOf("@") == -1) 
                || (this.candidateDetails.candidateEmail.indexOf(".") == -1 )
                || (this.candidateDetails.candidateEmail.lastIndexOf(".") < this.candidateDetails.candidateEmail.indexOf("@")) 
                || (this.candidateDetails.candidateEmail.indexOf("@") != this.candidateDetails.candidateEmail.lastIndexOf("@"))) {
                    alert("Please enter valid email address!");

                    $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                    $("#detailform :input").prop("disabled", false);
                    $("#editreadonly_hidden").val(1);
            }
            else if(this.candidateDetails.candidateContact.length != 10){
                alert("Please enter 10 digit contact number");

                $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                $("#detailform :input").prop("disabled", false);
                $("#editreadonly_hidden").val(1);
            }
            else if((this.candidateDetails.candidateName != null) && (this.candidateDetails.candidateEmail != null)
             && (this.candidateDetails.experience != null) && (this.candidateDetails.ctcFixed != null)
             && (this.candidateDetails.ctcVariable != null) && (this.candidateDetails.ctcEsops != null)
             && (this.candidateDetails.eCTCFixed != null) && (this.candidateDetails.eCTCVariable != null)
             && (this.candidateDetails.eCTCEsops != null)
             && (this.candidateDetails.location != null)) {

                let reqObject = Object.assign(this.candidateDetails);
                reqObject.candidateId = this.selectedCandidate._id;

                SERVICE.get(this).saveCandidateDetails(reqObject).then(response => {
                    console.log(response.message);
                }, error => {
                    console.log(error);
                });
            } else {

                alert("Please enter required fields");

                $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                $("#detailform :input").prop("disabled", false);
                $("#editreadonly_hidden").val(1);
            }
           
        }
    };

    uploadResume(candidateId){
        
        var file = this.resumeFile;
        if(file) {
            var fd = new FormData();
            fd.append('resumeFile', file);
            fd.append('candidateId', candidateId);
            fd.append('uploadDate', new Date());

            SERVICE.get(this).uploadResumeFile(fd).then(response => {
                console.log(response.message);
                if(response.message == "ERROR")
                    alert("Error occurred while uploading resume file.\nPlease select proper file type and size.");
                this.resumeFile = null;
                document.getElementById("file-input").value="";
                document.getElementById("new-file-input2").value="";
            }, error => {
                    console.log(error);
            });
        } else {
            alert("Please select a file to upload!");
            document.getElementById("file-input").value="";
            document.getElementById("new-file-input2").value="";
        }

    };

    uploadNewCandidateResume(){
        var file = this.newCandidateResumeFile;
        if(this.newCandReg.name || this.newCandReg.email || this.newCandReg.phNum){
            if(file) {
                var fd = new FormData();
                fd.append('resumeFile', file);
                fd.append('candidateName', this.newCandReg.name);
                fd.append('candidateEmail', this.newCandReg.email);
                fd.append('candidateContact', this.newCandReg.phNum);
                fd.append('jobId', this.selectedJobDetail._id);
                fd.append('recruiterId', this.userId);
                fd.append('assigneeName', this.AuthFactory.auth.user.displayName)
                fd.append('uploadDate', new Date());

                SERVICE.get(this).uploadNewCandidateResumeFile(fd).then(response => {
                    console.log(response.message);
                    if(response.message == "ERROR"){
                        alert("Error occurred while uploading resume file.\nPlease select proper file type and size.");
                    }else if(response.message == "DUPLICATE"){
                        alert("Candidate already exists with the email address or phone number!");
                    } else {
                        this.candidateDetailsForJob(this.selectedJobDetail._id);
                        this.newCandidateResumeFile = null;
                        this.newCandReg = {"name": null, "email": null, "phNum": null};
                        document.getElementById("new-file-input").value="";
                        $('#uploadNewResume').modal('hide');
                    }
                }, error => {
                    console.log(error);
                });
            } else {
                alert("Please select a file to upload!");
                document.getElementById("new-file-input").value="";
            }
        } else {
            alert("Please enter required inputs!");
        }
    };

    applyfilter(){
        this.checkedCandidateList = [];
        let filterObj = {"NEW": [], "SHORTLIST": [],"INTERVIEW": [], "OFFER": [], "JOINED": [], "CANDIDATE": []};
        filterObj[this.presentStage] = this.filterObject[this.presentStage];

        trackFilterObjectLastApplied = JSON.parse(JSON.stringify(this.filterObject[this.presentStage]));
        
        // Modifying filterObject to match mongoDB API schema
        filterObj[this.presentStage] = filterObj[this.presentStage]
        
          // Filtering out any tags with undefined or null value
          .filter(filter => typeof filter.filterValue !== 'undefined' && filter.filterValue !== null)
          
          // Reordering the key,value pair to match mongoDB API schema
          .map(filter => ({ [filter.filterTag]: filter.filterValue }));
        
        SERVICE.get(this).candidateDetailsForJob(this.userId, this.selectedJobDetail._id, filterObj, "job").then(response => {
            this.allCandidateDetail = response.data;
            
            let leng = this.allCandidateDetail[this.presentStage].length;
            if(leng > 0) {
                this.selectedCandidate = this.allCandidateDetail[this.presentStage][leng-1];
                this.candidateDetailsFunction(this.allCandidateDetail[this.presentStage][leng-1]._id);

                for(var i=0; i<leng; i++){
                    this.checkedCandidateList.push(false);
                }
            }
            else
                this.selectedCandidate = null;
        }, error => {
            console.log(error);
        });
    };

    getSimilarJobsData(){
        //TODO
    }

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

    moveToNextStage(stageFrom, stageTo) {
        let proceedFlag = true;
        if(stageFrom === "SHORTLIST"){ 
            let leng = this.checkedCandidateListIds.length;
            let leng2 = this.allCandidateDetail[this.presentStage].length;
            let count = 0; 
            for(var i=0; i<leng; i++){
                for(var j=0; j<leng2; j++){
                    let { _id, jobs } = this.allCandidateDetail[this.presentStage][j];
                    if (
                        this.checkedCandidateListIds[i] === _id &&
                        (jobs && jobs.interview && jobs.interview.round == 1)
                    ) {
                        count++;
                        break;
                    }
                }
            }
            if(leng != count){
                proceedFlag = false;
                alert("Please assign interview date to all candidates before moving them to next stage");
            }
        }
        if(proceedFlag){
            let reqObject = {};
            reqObject.jobId = this.selectedJobDetail._id;
            reqObject.userId = this.userId;
            reqObject.assignStageFrom = stageFrom;
            reqObject.assignStageTo = stageTo;
            reqObject.timestamp = new Date();
            reqObject.candidateId = this.checkedCandidateListIds;

            SERVICE.get(this).moveToNextStage(reqObject).then(response => {
                console.log(response.message);
                this.setStage(this.presentStage); //TO reset the filters applied. If satus get changed.
            }, error => {
                    console.log(error);
            });
        }
    };

    moveToInactive(reasons) {
        let reqObject = {
            jobId: this.selectedJobDetail._id,
            reason: reasons,
            timestamp: new Date()
        };
        console.log(reqObject);

        SERVICE.get(this).moveJobToInactive(reqObject).then(response => {
            console.log(response.message);
            this.moveToInactiveReasons = [];
            this.initJobs();
        }, error => {
            this.moveToInactiveReasons = [];
            console.log(error);
        });
    };
    moveJobToActive() {
        let reqObject = {
            jobId: this.selectedJobDetail._id
        };

        SERVICE.get(this).moveJobToActive(reqObject).then(response => {
            console.log(response.message);
            this.initJobs();
        }, error => {
            console.log(error);
        });
    };

    changeStatusEvent(status){
        this.changeStatusModel.status = status;
        this.changeStatusModel.statusInputs=[];
    }

    abscondingStatusEvent(){
        this.changeStatusModel.status = "ABSCONDING";
        this.changeStatusModel.statusInputs=[];
        if(this.abscondingReason){
            this.changeStatusModel.statusInputs.push({"inputTitle": "Reason", "inputValue": this.abscondingReason})
        }
        if(this.abscondingDate){
            this.changeStatusModel.statusInputs.push({"inputTitle": "Date", "inputValue": this.abscondingDate})
        }
        this.changeStatus();
    }

    changeStatus() {
        let reqObject = {};
        reqObject.jobId = this.selectedJobDetail._id;
        reqObject.candidateId = this.checkedCandidateListIds;
        reqObject.statusChangedBy = this.userId;
        reqObject.stage = this.presentStage;
        reqObject.requestFromState = 'job';
        reqObject.status = this.changeStatusModel.status;
        reqObject.statusInputs = this.changeStatusModel.statusInputs;

        SERVICE.get(this).changeStatus(reqObject).then(response => {
            this.changeStatusModel = {status: "", statusInputs: []};
            this.setStage(this.presentStage); //TO reset the filters applied. If satus get changed.
        }, error => {
            console.log(error);
            this.changeStatusModel = {status: "", statusInputs: []};
        });
    };

    getFeedMsgThread(jobId, candidateId){
        this.feedMsgRecords = {};
        SERVICE.get(this).feedMsgThreadData(jobId, candidateId).then(response => {
            for(let i in response.TAGS){
                response.TAGS[i].sentTo = (response.TAGS[i].sentTo).split(",").join(" @");
            }
            this.feedMsgRecords = response;
        }, error => {
            console.log(error);
        });
    }
    getFeedJobData(){
        
        SERVICE.get(this).feedJobData(this.selectedCandidate._id).then(response => {
            
            this.feedJobRecords = response;
        }, error => {
            console.log(error);
        });
    }

    candidateDetailsFunction(candidateId) {
        
        SERVICE.get(this).getLinkedInLink(candidateId).then(response => {
            this.linkedInLink = response.linkedinLink;
        }, error => {
                console.log(error);
        });
        
        SERVICE.get(this).getResumeMetadata(candidateId).then(response => {
            this.resumeFileMetadata = response;
        }, error => {
            console.log(error);
        });
        
        SERVICE.get(this).getCandidateDetails(candidateId).then(response => {
            this.candidateDetails = response;
            
        }, error => {
                console.log(error);
        });

        // To get feed job records
        this.getFeedJobData();

    };

    candidateDetailsForJob(jobId) {
        this.sideMenuState.jobId = jobId;
        this.checkedCandidateList = [];

        let filterObj = {"NEW": [], "SHORTLIST": [],"INTERVIEW": [], "OFFER": [], "JOINED": [], "CANDIDATE": []};
  
        SERVICE.get(this).candidateDetailsForJob(this.userId, jobId, filterObj, "job").then(response => {

            this.allCandidateDetail = response.data;
            let leng = this.allCandidateDetail[this.presentStage].length;
            if(leng > 0) {
                let maxCandidateIdPointer = 0;
                for(let i=0; i<leng; i++){
                    if(this.allCandidateDetail[this.presentStage][maxCandidateIdPointer]._id < this.allCandidateDetail[this.presentStage][i]._id)
                        maxCandidateIdPointer = i;
                }
                this.selectedCandidate = this.allCandidateDetail[this.presentStage][maxCandidateIdPointer];
                this.candidateDetailsFunction(this.allCandidateDetail[this.presentStage][maxCandidateIdPointer]._id);

                for(var i=0; i<leng; i++){
                    this.checkedCandidateList.push(false);
                }
            }
            else
                this.selectedCandidate = null;

        }, error => {
                console.log(error);
        });
    };

    getMainMenuData(jobId){
        for(var arrElem of this.sideMenuJobsDetails){
            if(arrElem._id === jobId){
                this.selectedJobDetail = arrElem;
                break;
            }
        }
        this.presentStage = "NEW";
        this.initSimilarResume(0);
        this.candidateDetailsForJob(jobId);
    };

    getAllRecruiters() {
        SERVICE.get(this).getAllRecruiters().then(response => {
            this.allRecruiters = response.data;
        }, error => {
            console.log(error);
        });
    };

    getJobsDetail(userId, flag, status) {

        this.sideMenuState = {flag: flag, status: status};

        SERVICE.get(this).getJobsDetail(userId, flag, status).then(response => {

            this.sideMenuJobsDetails = response.data;
            this.sideMenuState.jobId = response.data[0]._id;
            if(this.shareData.getProperty() == 'blank'){
                this.getMainMenuData(this.sideMenuState.jobId);
            } else {
                this.getMainMenuData(this.shareData.getProperty().jobId);
                this.shareData.setProperty('blank')
            }
            this.getAllRecruiters();
        }, error => {
            console.log(error);
        });
    };

    initJobs() {
        this.getJobsDetail(this.userId, 'myjob', 'active');
    };

    //Similar Resume Code: START
    initSimilarResume(skip) {
        let reqData = {
            ...this.selectedJobDetail,
            jobId: this.selectedJobDetail._id,
            skip
        }

        SERVICE.get(this).getInternalDataCandidateList(reqData).then(response => {
            this.internalCandidateList = response.data;
            this.internalCandidateListCount = response.count;

            // Check candidate functionality
            this.flagCheckAllIDCandidate = false;
            this.checkIDCandidateList = [];
            for(let i=0; i<this.internalCandidateList.length; i++){
                this.checkIDCandidateList.push(false);
            }
            //Get candidate Details section data
            if(this.internalCandidateList.length > 0){
                this.internalDataCandidateDetailsFunction(this.internalCandidateList[0]._id);
            }
        }, error => {
            console.log(error);
        });
    }
    checkAllIDCandidate(){
        this.checkIDCandidateList = [];
        for(let i=0; i<this.internalCandidateList.length; i++){
                this.checkIDCandidateList.push(this.flagCheckAllIDCandidate);
            }
    }
    getSelectedIDCandidates() {
        this.checkedIDCandidateNum = 0;
        this.selectedIDCandidateIdArr = [];
        let leng = this.internalCandidateList.length;
        for(let i=0; i<leng; i++){  
            if(this.checkIDCandidateList[i] === true){
                this.checkedIDCandidateNum++;
                this.selectedIDCandidateIdArr.push(this.internalCandidateList[i]._id);
            }
        }
        if(this.checkedIDCandidateNum === 0){
            alert("Please select atleast one candidate from the list");
        }
    }
    moveIDCandidatesToActiveJob() {
        let reqData = {
            "userId": this.userId,
            "jobId": this.selectedJobDetail._id,
            "candidateId": this.selectedIDCandidateIdArr,
            "timestamp": new Date()
        };
    
        SERVICE.get(this).moveToActiveJob(reqData).then(response => {
            console.log(response);
            this.checkAllIDCandidate();
            this.getMainMenuData(this.selectedJobDetail.jobId);
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
    saveIDCandidateDetails(candidateId) {
        if(document.getElementById("editreadonly_hidden1").value == 0){
            if((this.iDataCandidateDetails.email.indexOf("@") == -1) 
                || (this.iDataCandidateDetails.email.indexOf(".") == -1 )
                || (this.iDataCandidateDetails.email.lastIndexOf(".") < this.iDataCandidateDetails.email.indexOf("@")) 
                || (this.iDataCandidateDetails.email.indexOf("@") != this.iDataCandidateDetails.email.lastIndexOf("@"))) {
                    alert("Please enter valid email address!");

                    $('#editreadonly1').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                    $("#detailform1 :input").prop("disabled", false);
                    $("#editreadonly_hidden1").val(1);
            }
            else if(this.iDataCandidateDetails.contact.length != 10){
                alert("Please enter 10 digit contact number");

                $('#editreadonly1').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                $("#detailform1 :input").prop("disabled", false);
                $("#editreadonly_hidden1").val(1);
            }
            else if((this.iDataCandidateDetails.candidateName != null) && (this.iDataCandidateDetails.email != null)
             && (this.iDataCandidateDetails.experience != null) && (this.iDataCandidateDetails.ctcFixed != null)
             && (this.iDataCandidateDetails.ctcVariable != null) && (this.iDataCandidateDetails.ctcEsops != null)
             && (this.iDataCandidateDetails.eCTCFixed != null) && (this.iDataCandidateDetails.eCTCVariable != null)
             && (this.iDataCandidateDetails.eCTCEsops != null)
             && (this.iDataCandidateDetails.location != null)) {

                let reqObject = Object.assign(this.iDataCandidateDetails);
                reqObject.candidateId = candidateId;
                console.log(reqObject);

                SERVICE.get(this).saveCandidateDetails(reqObject).then(response => {
                    console.log(response.message);
                }, error => {
                    console.log(error);
                });
            } else {

                alert("Please enter required fields");

                // $('#editreadonly1').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                // $("#detailform1 :input").prop("disabled", false);
                // $("#editreadonly_hidden1").val(1);
            }
           
        }
    }
    //Similar Resume Code: END
}

JobsController.$inject = ['$rootScope', 'AuthFactory', 'jobsService', 'shareData']

export default JobsController;
