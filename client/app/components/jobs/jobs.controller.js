
const SERVICE = new WeakMap();
let trackFilterObjectLastApplied = [{"filterTag":"filterByRecruiter"},{"filterTag":"selectStatus"}]; //for init stage -  New Resume stage

class JobsController {
  constructor(AuthFactory, jobsService) {
        this.userId = 1; //get this data from localstorage
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
        this.candidateDetailsForJob(this.selectedJobDetail.jobId);

        // this.checkedCandidateList = [];
        // var leng = this.allCandidateDetail[this.presentStage].length;
        // for(var i=0; i<leng; i++){
        //     this.checkedCandidateList.push(false);
        // }
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
        for(var i=0; i<leng; i++){
            if(this.checkedCandidateList[i] === true) {
                this.checkedCandidateNum++;
                this.checkedCandidateListIds.push(this.allCandidateDetail[this.presentStage][leng-1-i].candidateId);
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
            "jobId": this.selectedJobDetail.jobId,
            "candidateId": this.selectedCandidate.candidateId,
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
            this.interviewDateData = {"date": null, "time": null, "meridian": null, "round": 1, "rescheduleReason": null};
        }, error => {
            this.interviewDateData = {"date": null, "time": null, "meridian": null, "round": 1, "rescheduleReason": null};
            console.log(error);
        });
    };

    selectedCandidateDetails(candidateId) {
        for(var arrElem of this.allCandidateDetail[this.presentStage]){
            if(arrElem.candidateId === candidateId){
                this.selectedCandidate = arrElem;
                this.candidateDetailsFunction(candidateId);
                break;
            }
        }
    };

    saveCandidateDetails(){
        if(document.getElementById("editreadonly_hidden").value == 0){
            let reqObject = Object.assign(this.candidateDetails);
            reqObject.candidateId = this.selectedCandidate.candidateId;

            SERVICE.get(this).saveCandidateDetails(reqObject).then(response => {
                console.log(response.message);
            }, error => {
                console.log(error);
            });
        }
    };

    uploadResume(){
        var file = this.resumeFile;
        if(file) {
            var fd = new FormData();
            fd.append('resumeFile', file);
            fd.append('candidateId', this.selectedCandidate.candidateId);
            fd.append('uploadDate', new Date());

            SERVICE.get(this).uploadResumeFile(fd).then(response => {
                console.log(response.message);
                if(response.message == "ERROR")
                    alert("Error occurred while uploading resume file.\nPlease select proper file type and size.");
                this.resumeFile = null;
                document.getElementById("file-input").value="";
            }, error => {
                    console.log(error);
            });
        } else {
            alert("Please select a file to upload!");
            document.getElementById("file-input").value="";
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
                fd.append('jobId', this.selectedJobDetail.jobId);
                fd.append('recruiterId', this.userId);
                fd.append('uploadDate', new Date());

                SERVICE.get(this).uploadNewCandidateResumeFile(fd).then(response => {
                    console.log(response.message);
                    if(response.message == "ERROR"){
                        alert("Error occurred while uploading resume file.\nPlease select proper file type and size.");
                    }else if(response.message == "DUPLICATE"){
                        alert("Candidate already exists with the email address or phone number!");
                    } else {
                        this.candidateDetailsForJob(this.selectedJobDetail.jobId);
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

        SERVICE.get(this).candidateDetailsForJob(this.userId, this.selectedJobDetail.jobId, filterObj, "job").then(response => {
            this.allCandidateDetail = response.data;

            let leng = this.allCandidateDetail[this.presentStage].length;
            if(leng > 0) {
                this.selectedCandidate = this.allCandidateDetail[this.presentStage][leng-1];
                this.candidateDetailsFunction(this.allCandidateDetail[this.presentStage][leng-1].candidateId);

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

    sendMessage(jobId) {
        var reqData = {
            "jobId": jobId,
            "userId": this.userId,
            "candidateId": this.selectedCandidate.candidateId,
            "timestamp": new Date(),
            "message": this.postMessage
            };

        SERVICE.get(this).sendMessage(reqData).then(response => {
            this.postMessage = "";
            this.getFeedMsgThread(jobId);
        }, error => {
            this.postMessage = "";
        });
    }

    moveToNextStage(stageFrom, stageTo) {
        let reqObject = {};
        reqObject.jobId = this.selectedJobDetail.jobId;
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
    };

    moveToInactive(reasons) {
        let reqObject = {
            jobId: this.selectedJobDetail.jobId,
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
        reqObject.jobId = this.selectedJobDetail.jobId;
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

    getFeedMsgThread(jobId){
        this.feedMsgRecords = {};
        SERVICE.get(this).feedMsgThreadData(jobId, this.selectedCandidate.candidateId).then(response => {
            for(let i in response.TAGS){
                response.TAGS[i].sentTo = (response.TAGS[i].sentTo).split(",").join(" @");
            }
            this.feedMsgRecords = response;
        }, error => {
            console.log(error);
        });
    }
    getFeedJobData(){
        
        SERVICE.get(this).feedJobData(this.selectedCandidate.candidateId).then(response => {
            
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
                this.selectedCandidate = this.allCandidateDetail[this.presentStage][leng-1];
                this.candidateDetailsFunction(this.allCandidateDetail[this.presentStage][leng-1].candidateId);

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
            if(arrElem.jobId === jobId){
                this.selectedJobDetail = arrElem;
                break;
            }
        }
        this.presentStage = "NEW";
        // this.getSimilarResumeStatistics(); //Implementation later
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
            this.sideMenuState.jobId = response.data[0].jobId;
            this.getMainMenuData(this.sideMenuState.jobId);
            this.getAllRecruiters();
        }, error => {
            console.log(error);
        });
    };

    initJobs() {
            this.getJobsDetail(this.userId, 'myjob', 'active');
    };
}

JobsController.$inject = ['AuthFactory', 'jobsService']

export default JobsController;
