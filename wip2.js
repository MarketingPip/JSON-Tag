/**!
 * @license JSON-Tag - A JavaScript library to easily render data from JSON locally or from a API / URL on your website inside of a <json> tag.
 * VERSION: 1.0.0
 * LICENSE & MORE INFO CAN BE FOUND AT https://github.com/MarketingPipeline/JSON-Tag/
 */


// import module(s)
import Hogan from "https://cdn.skypack.dev/hogan.js@3.0.2";
function renderJSONTags() {
  // Function to render a JSON tag
  const renderJSONTag = async (tag) => {
    try {
      let template = Hogan.compile(tag.innerHTML);

      if (tag.hasAttribute("local-json")) {
        let output = template.render(eval(tag.getAttribute("local-json")));
        tag.innerHTML = output;
      } else if (tag.hasAttribute("fetch-json")) {
        await fetchAndRenderJSON(tag);
      }

      setAttribute(tag);
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

  // Initialize function
  const initialize = () => {
    // Render existing JSON tags
    const existingJSONTags = document.querySelectorAll("json:not([json-rendered]):not([json-error])");
  
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

  
   initialize()
}


renderJSONTags()

let btn = document.getElementById("btn");
btn.addEventListener("click", (event) => {
  document.body.innerHTML += `<json fetch-json="https://api.github.com/users/MarketingPipeline/repos"> Showing a repo from MarketingPipeline<br> Repo title {{last_json_key}} <b>Description</b> {{json.0.description}} <b>Stars</b>: {{json.0.stargazers_count}} Repo URL <a href="{{json.0.url}}">Click to view!</a><br/></json>  
`
});
