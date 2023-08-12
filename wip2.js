// import module(s)
import Hogan from "https://cdn.skypack.dev/hogan.js@3.0.2";

function renderJSONTags() {
  // Function to render a JSON tag
  const renderJSONTag = async (tag) => {
    try {
     if (!tag.hasAttribute("json-rendered") && !tag.hasAttribute("json-error")) {
       setAttribute(tag);
       
      let template = Hogan.compile(tag.innerHTML);

      if (tag.hasAttribute("local-json")) {
        let data = eval(tag.getAttribute("local-json"));
        if (data) {
          data = {data:data}
          let output = template.render(data);
          tag.innerHTML = output;
        }
      }
         if(tag.hasAttribute("stored-json")){
           await StoredJSON(tag, template)
         }  
       
       if(tag.hasAttribute("store-json") && tag.hasAttribute("fetch-json")){
         let result =  await storeJSON(tag.getAttribute("fetch-json"), tag.getAttribute("data-name"))
           await fetchAndRenderJSON(tag, result);
         
         }
       
       if (tag.hasAttribute("fetch-json") && !tag.hasAttribute("store-json")) {
         await fetchAndRenderJSON(tag);
        
      }

      
     }
    } catch (error) {
      handleError(tag, error);
    }
  };

  // Function to handle errors
  const handleError = (tag, err) => {
    if (tag.hasAttribute("error-message")) {
      tag.innerHTML = tag.getAttribute("error-message");
    } 
   /* if (tag.hasAttribute("handle-error-message")) {
   
    }*/  
    //
      if (!tag.hasAttribute("handle-error-message") && !tag.hasAttribute("error-message")) {
      tag.innerHTML = `JSON-Tag Error: ${err.message}`;
    }

    console.error(`JSON Tag: Error - ${err.message}`);
    setAttribute(tag, "error");
  };

  // Function to set attributes
  const setAttribute = (tag, error) => {
      if (error) {
        tag.setAttribute("json-error", "");
      } else {
        tag.setAttribute("json-rendered", "");
      }
  };
  
  
  
   
async function storeJSON(url, id)
{
  try {
    let result = await fetchJSON(url)
    var script_tag = document.createElement('script');
    
    result = result
script_tag.type = 'JSON';
script_tag.id = id
script_tag.text = `${JSON.stringify(result)}`
document.body.appendChild(script_tag);
    return result
  } catch( err ) {
    console.error( err.message);
  }
}

  
  

  async function StoredJSON(tag, template){

    function renderStored(){
      
      let parsedData = JSON.parse(document.querySelector("#" + tag.getAttribute("data-name")).innerText)
     
       let output = template.render(parsedData)
            
				tag.innerHTML = output
    }
    
    if(!tag.hasAttribute("data-name")){
      throw {message: "No `data-name` Attribute Found"}
      }
    
    
    
    
    const delay = ms => new Promise(res => setTimeout(res, ms));
           
       /// NEED TO FIGURE OUT HOW TO THROW THIS ERROR.. 
    function scriptLoaded(){        
    if(document.querySelector("#" + tag.getAttribute("data-name")) == null){
            return false
               }
    }
    
    console.log(document.querySelector("#" + tag.getAttribute("data-name")))
                
    await delay(500)//
    if(scriptLoaded() === false){
      await delay(500)
      
      if(scriptLoaded() === false){
         await delay(500)
      }
      if(scriptLoaded() === false){
         await delay(500)
      }
      if(scriptLoaded() === false){
               throw {message: `Could not find stored JSON data named ${tag.getAttribute("data-name")} in the HTML page`}
      }
      if(scriptLoaded() !== false){
        return renderStored()
      }
      
    }
  
       if(scriptLoaded() != false){
         return renderStored()
       }
    
  }
  
  
  // Function to fetch JSON
  async function fetchJSON(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON data");
      }

      return {
        json: data
      };
    } catch (error) {
      throw new Error(`Fetch Error: ${error.message}`);
    }
  }

  // Function to fetch and render JSON
  const fetchAndRenderJSON = async (tag, json = false) => {
    try {
      let data = json || await fetchJSON(tag.getAttribute("fetch-json"));
      let template = Hogan.compile(tag.innerHTML);
      let output = template.render(data);
      tag.innerHTML = output;
    } catch (err) {
      handleError(tag, err);
    }
  };

  

  // Initialize function
  const initialize = () => {
    // Render existing JSON tags
    let existingJSONTags = [...document.querySelectorAll("json:not([json-rendered]):not([json-error])"),
                           ...document.querySelectorAll("[json]:not([json-rendered]):not([json-error])")]

   
   
    existingJSONTags.forEach(renderJSONTag);

    // Observe mutations to the DOM and render new JSON tags
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.tagName === "JSON" && !node.hasAttribute("json-rendered") && !node.hasAttribute("json-error")) {
              renderJSONTag(node);
            }
          });
        }
       
      }
    });

    observer.observe(document.body, {attribute: true, childList: true, subtree: true });
  };

  initialize();
}

renderJSONTags();
