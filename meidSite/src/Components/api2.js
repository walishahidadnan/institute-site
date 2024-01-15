<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const textArea = document.getElementById('Message');
    const charCount = document.getElementById('charCount');
    const maxLength = 200;

    textArea.addEventListener('input', () => {
        const remaining = maxLength - textArea.value.length;
        charCount.textContent = remaining;

        if (remaining < 0) {
            textArea.value = textArea.value.substring(0, maxLength);
            charCount.textContent = 0;
        }
    });

    function formatDate(dateString) {
        return dateString && typeof dateString === 'string' ? dateString.split('T')[0] : ''; 
    }

    function mapApiResponse(apiResponse, isTrialResults) {
        const trialDataArray = apiResponse?.data?.getAllTrialCalendarPublic?.data || [];
        const formattedEntries = [];

        trialDataArray.forEach(trialData => {
            trialData.search.forEach(searchEntry => {
                const formattedEntry = {
                    name: trialData.host.trialSecretaryName,
                    date: formatDate(trialData.trial.trialDate),
                    location: trialData.trial.trialLocationAddress,
                    level: searchEntry.level,
                    host: trialData.host.hostName,
                    resultId: trialData.id,
                    openDate: formatDate(trialData.trial.openDate),
                    closeDate: formatDate(trialData.trial.closeDate)
                };
								
                formattedEntries.push(formattedEntry);
            });
        });

        return formattedEntries;
    }


    function initializeDataTable(tableId, tableData, columns, tableSearchId) {
        var dataTable = $('#' + tableId).DataTable({
            data: tableData,
            columns: columns,
            "info": false,
            "lengthChange": false,
            "searching": true,
            "ordering": false,
            "pageLength": 5
        }).on('init.dt', function () {
            $('.viewresultscenter').closest('thead').find('th').eq(5).addClass('viewresultscenter');
        });

        $('#' + tableSearchId).keyup(function () {
            dataTable.search($(this).val()).draw();
        });
    }

    const trialResultsQueryURL = 'https://k9-dev-api.powerhouse.so/graphql';
    const trialCalendarQueryURL = 'https://k9-dev-api.powerhouse.so/graphql';

    const trialResultsQueryoptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query getAllTrialCalendarPublic{
  getAllTrialCalendarPublic(pageNumber: 1, pageSize: 10) {
    data{
      	id
        authId
      	host {
          id
          hostName
          contactAddress
          city
          trialSecretaryName
          state
          trialSecretaryEmail
          zip
        }
      trial{
        id
        trialLocationName
        trialLocationAddress
        city
        state
        zip
        timezone
        trialDate
        openDate
        closeDate
        trialFile
      }
      search{
        id
        level
        search
        searchName
        entryFee
      }
    }
    pageNumber
    pageSize
    totalDocs
    totalPages
    totalCount
  }
}
`
        }),
    };

    const trialCalendarQueryoptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query getTrialResultByTrialCalendarPublic($trialCalendarId: String!) {
                getTrialResultByTrialCalendarPublic(pageNumber: 1, pageSize: 10, trialCalendarId: $trialCalendarId) {
                    data {
                        id
                        date
                        search
                        handler
                        dog
                        breed
                        div
                        qNq
                        ngReason
                        time
                        hidesFound
                        faults
                        faultReason
                        points
                        place
                        timeLimit
                        hidesSet
                        judgeNotes
                        searchName
                        trialCalendarId
                    }
                    pageNumber
                    pageSize
                    totalDocs
                    totalPages
                    totalCount
                }
            }`,
            variables: { "trialCalendarId": "1" }
        }),
    };

    // Fetch trial results and trial calendar data concurrently
    Promise.all([
        fetch(trialResultsQueryURL, trialResultsQueryoptions).then(response => response.json()),
        fetch(trialCalendarQueryURL, trialCalendarQueryoptions).then(response => response.json())
    ])
    .then(([trialResultsData, trialCalendarData]) => {
        console.log(trialResultsData);
        console.log(trialCalendarData);

        if (trialResultsData.errors) {
            console.error('GraphQL Error in trialResultsQuery:', trialResultsData.errors);
        }

        if (trialCalendarData.errors) {
            console.error('GraphQL Error in trialCalendarQuery:', trialCalendarData.errors);
        }

        if (trialResultsData.errors || trialCalendarData.errors) {
            // Handle errors as needed, you might want to return or show an error message to the user.
            return;
        }

        const tableData1 = mapApiResponse(trialResultsData, true);
        const tableData2 = mapApiResponse(trialCalendarData, false);

        console.log("Formatted Table Data 1 (after mapApiResponse):", tableData1); 
        console.log("Formatted Table Data 2 (after mapApiResponse):", tableData2); 

        initializeDataTable('trialsTable1', tableData1, [
            { title: "Name", data: "name" },
            { title: "Date", data: "date" },
            { title: "Location", data: "location" },
            { title: "Level", data: "level" },
            { title: "Host", data: "host" },
            { title: "Open Date", data: "openDate" },
            { title: "Close Date", data: "closeDate" }
        ], 'trialsTableSearch1');

        initializeDataTable('trialsTable2', tableData2, [
            { title: "Name", data: "name" },
            { title: "Date", data: "date" },
            { title: "Location", data: "location" },
            { title: "Level", data: "level" },
            { title: "Host", data: "host" },
            {
                title: "View Results",
                data: "resultId",
                render: function (data, type, row) {
            
                    const trialHeading = `${formatDate(row.date)}, ${row.location}`;
                    return `<a href="/trial-result?trialId=${data}&trialHeading=${encodeURIComponent(trialHeading)}"
                                class="view-results-link">
                                <img src="https://uploads-ssl.webflow.com/6557ce78635d855780e92535/657823dd0a31d79407ce9147_share-04.svg" alt="View Results"/>
                            </a>`;
                },
                className: "viewresultscenter",
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).addClass('viewresultscenter');
                }
            }], 'trialsTableSearch2');
    })
    .catch(error => console.error('Error fetching data:', error));
});
</script>
