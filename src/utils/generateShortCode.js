
function checkOriginalURL(originalURL){

    console.log("I am triggered")
   try
   {
    const parsedURL = new URL(originalURL);
    return (parsedURL.protocol == "https:" || parsedURL.protocol == "http:")
   }
   catch(err)
   {
        return false;
   }
}


function generateShortCode(shortCodeLength){

    const randomString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    let shortCode = '';

    for(let i = 0;i<shortCodeLength;++i)
    {
        shortCode += randomString[Math.floor(Math.random()*62)];
    }
    return shortCode;
}


async function generateValidShortCode(userId)
{
    let shortCode = generateShortCode(6);
    
    while(! (await checkShortCode(shortCode,userId)))
    {
        shortCode = generateShortCode(6);
    }

    return shortCode;
}

module.exports = {
    checkOriginalURL,
    generateShortCode
}