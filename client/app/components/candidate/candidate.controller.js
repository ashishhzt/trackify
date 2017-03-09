const SERVICE = new WeakMap();

class CandidateController {
  constructor($state, AuthFactory, candidateService, shareData) {
      this.userId = 1;
      this.idSkip = 0;
      this.checkIDCandidateList = [];
      this.flagCheckAllIDCandidate = false;
      this.sideMenuState = {flag: "myjob", status: "active"};
      this.$state = $state;
      this.shareData = shareData;
      
      SERVICE.set(this, candidateService);
  }

    checkAllIDCandidate(){
        this.checkIDCandidateList = [];
        for(let i=0; i<this.allCandidateDetails.length; i++){
                this.checkIDCandidateList.push(this.flagCheckAllIDCandidate);
            }
    }
    getSelectedIDCandidates() {
        this.checkedIDCandidateNum = 0;
        this.selectedIDCandidateIdArr = [];
        let leng = this.allCandidateDetails.length;
        for(let i=0; i<leng; i++){  
            if(this.checkIDCandidateList[i] === true){
                this.checkedIDCandidateNum++;
                this.selectedIDCandidateIdArr.push(this.allCandidateDetails[i].candidateId);
            }
        }
        if(this.checkedIDCandidateNum === 0){
            alert("Please select atleast one candidate from the list");
        }
    }
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
                document.getElementById("new-file-input2").value="";
            }, error => {
                    console.log(error);
            });
        } else {
            alert("Please select a file to upload!");
            document.getElementById("new-file-input2").value="";
        }

    };
    saveIDCandidateDetails(candidateId) {
        
        if(document.getElementById("editreadonly_hidden").value == 0){
            if((this.iDataCandidateDetails.email.indexOf("@") == -1) 
                || (this.iDataCandidateDetails.email.indexOf(".") == -1 )
                || (this.iDataCandidateDetails.email.lastIndexOf(".") < this.iDataCandidateDetails.email.indexOf("@")) 
                || (this.iDataCandidateDetails.email.indexOf("@") != this.iDataCandidateDetails.email.lastIndexOf("@"))) {
                    alert("Please enter valid email address!");

                    $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                    $("#detailform :input").prop("disabled", false);
                    $("#editreadonly_hidden").val(1);
            }
            else if(this.iDataCandidateDetails.contact.length != 10){
                alert("Please enter 10 digit contact number");

                $('#editreadonly').html("<i class='fa fa-floppy-o' aria-hidden='true'></i>");
                $("#detailform :input").prop("disabled", false);
                $("#editreadonly_hidden").val(1);
            }
            else if((this.iDataCandidateDetails.candidateName != null) && (this.iDataCandidateDetails.email != null)
             && (this.iDataCandidateDetails.experience != null) && (this.iDataCandidateDetails.ctcFixed != null)
             && (this.iDataCandidateDetails.ctcVariable != null) && (this.iDataCandidateDetails.ctcEsops != null)
             && (this.iDataCandidateDetails.eCTCFixed != null) && (this.iDataCandidateDetails.eCTCVariable != null)
             && (this.iDataCandidateDetails.eCTCEsops != null)
             && (this.iDataCandidateDetails.location != null)) {

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
        this.sideMenuState = {flag: flag, status: status};

        SERVICE.get(this).getJobsDetail(userId, flag, status).then(response => {
            this.sideMenuJobsDetails = response.data;
        }, error => {
            console.log(error);
        });

        SERVICE.get(this).getAllInternalDataCandidateList(this.idSkip).then(response => {
            this.allCandidateDetails = response.data;
            this.allCandidateCount = response.count;
            // Check candidate functionality
            this.flagCheckAllIDCandidate = false;
            this.checkIDCandidateList = [];
            for(let i=0; i<this.allCandidateDetails.length; i++){
                this.checkIDCandidateList.push(false);
            }
            //Get candidate Details section data
            if(this.allCandidateDetails.length > 0){
                this.internalDataCandidateDetailsFunction(this.allCandidateDetails[0].candidateId);
            }
        }, error => {
            console.log(error);
        });
    };
    skipRecall(evt){
        if(evt == '+'  && (this.idSkip+50) <= allCandidateCount){
            this.idSkip = this.idSkip+50;
            this.getJobsDetail(this.userId, this.sideMenuState.flag, this.sideMenuState.status);
        }
        if(evt == '-' && (this.idSkip-50) >= 0){
            this.idSkip = this.idSkip-50;
            this.getJobsDetail(this.userId, this.sideMenuState.flag, this.sideMenuState.status);
        }
    }
    initJobs() {
            $("#detailform :input").prop("disabled", true);
            this.getJobsDetail(this.userId, this.sideMenuState.flag, this.sideMenuState.status);
    };
    navToJobModule(jobId){
        let temp = {
            "jobId": jobId,
            "flag": this.sideMenuState.flag,
            "status": this.sideMenuState.status
        };  
        this.shareData.setProperty(temp);
        this.$state.go('jobs');
    }
}

CandidateController.$inject = ['$state', 'AuthFactory', 'candidateService', 'shareData']

export default CandidateController;
