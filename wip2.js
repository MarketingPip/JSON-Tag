// import module(s)
import Hogan from "https://cdn.skypack.dev/hogan.js@3.0.2";

function renderJSONTags() {
  // Function to render a JSON tag
  const renderJSONTag = async (tag) => {
    try {
     if (!tag.hasAttribute("json-rendered") || !tag.hasAttribute("json-error")) {
       setAttribute(tag);
       
      let template = Hogan.compile(tag.innerHTML);

      if (tag.hasAttribute("local-json")) {
        const data = getData(tag.getAttribute("local-json"));
        if (data) {
          let output = template.render(data);
          tag.innerHTML = output;
        }
      } else if (tag.hasAttribute("fetch-json")) {
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
    } else {
      tag.innerHTML = `JSON-Tag Error: ${err.message}`;
    }

    console.error(`JSON Tag: Error - ${err.message}`);
    setAttribute(tag, "error");
  };

  // Function to set attributes
  const setAttribute = (tag, error) => {
    if (!tag.hasAttribute("json-rendered") && !tag.hasAttribute("json-error")) {
      if (error) {
        tag.setAttribute("json-error", "");
      } else {
        tag.setAttribute("json-rendered", "");
      }
    }
  };

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
  const fetchAndRenderJSON = async (tag) => {
    try {
      let data = await fetchJSON(tag.getAttribute("fetch-json"));
      let template = Hogan.compile(tag.innerHTML);
      let output = template.render(data);
      tag.innerHTML = output;
    } catch (err) {
      handleError(tag, err);
    }
  };

  // Function to get data from global variables
  const getData = (variableName) => {
    
     console.log(variableName)
    const dataMapping = window[variableName];
    console.log( dataMapping)
    if (typeof dataMapping === "object") {
     
      return dataMapping;
    }
    return null;
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

    observer.observe(document.body, { childList: true, subtree: true });
  };

  initialize();
}

renderJSONTags();
