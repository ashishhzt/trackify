const HTTP = new WeakMap();

class jobsService {

    constructor($http) {
        HTTP.set(this, $http);
    }

    getJobsDetail(userId, flag, status) {
        return HTTP.get(this).get(`/api/jobs/getJobsDetail/${userId}/${flag}/${status}`).then(result => result.data);
    }
    candidateDetailsForJob(userId, jobId, filter, filterFrom) {
        let reqObj = { userId, jobId, filter, filterFrom };
        return HTTP.get(this).post("/api/jobs/candidateDetailsForJob", reqObj).then(result => result.data);
    }

    getResumeMetadata(candidateId) {
        return HTTP.get(this).get(`/api/jobs/getResumeMetadata/${candidateId}`).then(result => result.data);
    }

    uploadResumeFile(fd) {
        return HTTP.get(this).post("/api/jobs/uploadResume", fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).then(result => result.data);
    }

    uploadNewCandidateResumeFile(fd) {
        return HTTP.get(this).post("/api/jobs/uploadNewCandidateResume", fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).then(result => result.data);
    }

    moveToNextStage(requestData) {
        return HTTP.get(this).post("/api/jobs/moveToNextStage", requestData).then(result => result.data);
    }

    moveToActiveJob(requestData) {
        return HTTP.get(this).post("/api/jobs/moveToActiveJob", requestData).then(result => result.data);
    }
    moveJobToActive(requestData) {
        return HTTP.get(this).post("/api/jobs/moveJobToActive", requestData).then(result => result.data);
    }
    moveJobToInactive(requestData) {
        return HTTP.get(this).post("/api/jobs/moveToInactiveJob", requestData).then(result => result.data);
    }

    changeStatus(requestData) {
        return HTTP.get(this).post("/api/jobs/changeStatus", requestData).then(result => result.data);
    }
    getCandidateDetails(candidateId) {
        return HTTP.get(this).get(`/api/jobs/candidateDetails/${candidateId}`).then(result => result.data);
    }

    getSimilarJobsData(reqData) {
        return HTTP.get(this).post("/api/jobs/getSimilarJobs", reqData).then(result => result.data);
    }

    feedJobData(candidateId) {
        return HTTP.get(this).get(`/api/jobs/feedJobData/${candidateId}`).then(result => result.data);
    }

    feedMsgThreadData(jobId, candidateId) {
        return HTTP.get(this).get(`/api/jobs/getFeedThread/${jobId}/${candidateId}`).then(result => result.data);
    }

    saveCandidateDetails(formData) {
        return HTTP.get(this).post("/api/jobs/updateCandidateDetails", formData).then(result => result.data);
    }

    sendMessage(formData) {
        return HTTP.get(this).post("/api/jobs/savePostMessage", formData).then(result => result.data);
    }

    addInterviewDate(reqData) {
        return HTTP.get(this).post("/api/jobs/addInterviewDate", reqData).then(result => result.data);
    }

    getAllRecruiters() {
        return HTTP.get(this).get('/api/jobs/allRecruiters').then(result => result.data);
    }

    getLinkedInLink(candidateId) {
        return HTTP.get(this).get(`/api/jobs/linkedinLink/${candidateId}`).then(result => result.data);
    }
    getInternalDataCandidateList(reqObj) {
        return HTTP.get(this).post("/api/jobs/internalDataCandidateList", reqObj).then(result => result.data);
    }

    fetchMails(data) {
        var url = "/api/mailer?label=" + data.label;
        if (data.query) {
            url += "&query=" + data.query;
        }
        if (data.token) {
            url += "&token=" + data.token
        }
        console.log(url)
        return HTTP.get(this).get(url).then(result => result.data);
    }

    modifyEmail(id, action, label) {
        return HTTP.get(this).post("/api/mailer/modify", {
            id: id,
            addLabels: action ? [label] : [],
            removeLabels: action ? [] : [label]
        }).then(result => result.data);;
    }
    fetchMailCount() {
        return HTTP.get(this).get("/api/mailer/counter").then(result => result.data);
    }

    uploadAttachment(attachment) {
        console.log(attachment);
        return HTTP.get(this).post("/api/mailer/uploadAttachment", attachment, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).then(result => result.data);
    }

    composeMail(params) {
        return HTTP.get(this).post("/api/mailer", params).then(result => result.data);
    }

    readMail(message) {
        console.log(message);
        return HTTP.get(this).get("/api/mailer/" + message.threadId).then(result => result.data);
    }

    sendMailForJob(candidateList) {
        return HTTP.get(this).post('api/mailer/sendMailForJob', { candidateList: candidateList }).then(result => result.data);
    }

    downloadAttachment(details) {
        return HTTP.get(this).post('api/mailer/downloadAttachment', details).then(result => result.data);

    }

    fetchTemplates(params) {
        return HTTP.get(this).post('api/jobs/templates', params).then(result => result.data);
    }
    fetchClients() {
        return HTTP.get(this).get('/api/jobs/clientList').then(result => result.data);
    }
    fetchUsers() {
        return HTTP.get(this).get('/api/jobs/users').then(result => result.data);
    }
    updateTracker(detail) {
        return HTTP.get(this).post('api/jobs/updateTracker', detail).then(result => result.data);
    }
    updateUser(detail) {
        return HTTP.get(this).post('api/jobs/updateUser', detail).then(result => result.data);
    }
    saveTemplate(params) {
        return HTTP.get(this).post("/api/jobs/saveTemplate", params).then(result => result.data);
    }
    fetchClient(detail) {
        return HTTP.get(this).post('/api/jobs/fetchClient', detail).then(result => result.data);
    }
    updateClientInfo(details) {
        return HTTP.get(this).post('/api/jobs/updateClient', details).then(result => result.data);
    }

    static getInstance($http) {
        return new jobsService($http);
    }
}

jobsService.getInstance.$inject = ['$http'];

export default jobsService;
