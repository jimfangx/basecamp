const electron = require('electron')
const { ipcRenderer } = electron;

ipcRenderer.on('userInfoLoadData', (event, data) => {
    console.log(data)
    $('#title').text(`User Information for ${data.nameFirst} ${data.nameLast}`)
    $('#email').html(`<a class="fs-6 text-muted" style="text-decoration: none;">Email:</a> ${data.email}`)
    $('#timezone').html(`<a class="fs-6 text-muted" style="text-decoration: none;">Timezone:</a> ${data.timezone.replace(/_/g, " ")}`)
    $('#pronouns').html(`<a class="fs-6 text-muted" style="text-decoration: none;">Pronouns:</a> ${data.pronouns}`)
    $('#nsdaMemberNumber').html(`<a class="fs-6 text-muted" style="text-decoration: none;">NSDA #:</a> ${data.nsdaMemberNumber}`)
    $('#nsdaPoints').html(`<a class="fs-6 text-muted" style="text-decoration: none;">NSDA Points:</a> ${data.nsdaPoints}`)
    $('#districtTournament').html(`<a class="fs-6 text-muted" style="text-decoration: none;">District Tournament Eligibility:</a> ${data.districtTournament ? "Yes" : "No"}`)
    $('#nsdaHonor').html(`<a class="fs-6 text-muted" style="text-decoration: none;">Latest NSDA Honor:</a> ${data.latestNsdaHonor}`)
    $('#nsdaHonorDate').html(`<a class="fs-6 text-muted" style="text-decoration: none;">Latest NSDA Honor Date:</a> ${data.latestNsdaHonorDate}`)
    $('#nsdaAffiliation').html(`<a class="fs-6 text-muted" style="text-decoration: none;">Affiliation:</a> ${data.nsdaAffiliation}`)
})