import hubspot from "@hubspot/api-client";

export const getAllCompanies = async(token) => {
    
    const allCompanies = []
    let afterCounter = 0
    let companyNum 

    const hubspotClient = new hubspot.Client({
    accessToken: token,
    });

    //getting all the company records from the hubspot account in batches of 100
    //filtering the records by every company record where the name does not equal "あ"
    try {
        do {
            const PublicObjectSearchRequest = {
                limit: 100,
                after: afterCounter,
                filterGroups: [
                    {
                    filters: [
                        {
                        value: "あ",
                        propertyName: "name",
                        operator: "NEQ",
                        },
                    ]
                    },
                ],
                //the properties that are returned from the request
                properties: ["hs_object_id", "lifecyclestage", "name"]
            }; 

            const apiResponse = await hubspotClient.crm.companies.searchApi.doSearch(
                PublicObjectSearchRequest
            );
        
            //turns response in an object to access the result properties
            const res = JSON.parse((JSON.stringify(apiResponse, null, 2)));
           
            for(let i = 0; i < res.results.length; i++){
                allCompanies.push(res.results[i].properties)
            }
            
            companyNum = res.total
            afterCounter += 100
        
        } while (afterCounter <= companyNum);
    
    } catch (e) {
    e.message === "HTTP request failed"
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e);
    }

    const result = {
        loops: (afterCounter - 100) / 100,
        companies: allCompanies
    }

    return result
}


export const updateTimeProp = async(token, input, today) => {

    const hubspotClient = new hubspot.Client({ accessToken: token });; 
    
    const ids = []

    input.companies.map(el => ids.push({"id":el["hs_object_id"],"properties":{"today":today}}))
    
    //updates the company records in batches of 100
    //number of iterations comes from the number of iterations from the get company request loop
    try {
        for(let i = 0; i <= input.loops; i++){
            const batch = ids.slice(i * 100, (i*100)+100 );
            const BatchInputSimplePublicObjectBatchInput = { inputs: batch };

            const apiResponse = await hubspotClient.crm.companies.batchApi.update(BatchInputSimplePublicObjectBatchInput);
            //console.log(JSON.stringify(apiResponse, null, 2));
        }  
    } catch (e) {
      e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
}