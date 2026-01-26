(function () {
  try {
    const script = document.currentScript;

    if (!script) {
      return;
    }

    var widgetID = script.getAttribute("data-id");
    if (!widgetID || widgetID.trim() === "") {
      console.error("[K Xa Hajur] Widget ID is required");
      return;
    }

    // Get the current origin to build the API URL dynamically
    const origin = window.location.origin;
    
    fetch(origin + "/api/widget/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit",
      body: JSON.stringify({
        widgetID: widgetID,
      }),
    })
      .then(function (res) {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Session creation failed");
      })
      .then(function (data) {
        if (!data || !data.token) {
          throw new Error("Invalid session data");
        }

        var iframe = document.createElement("iframe");
        iframe.src =
          origin + "/embed?token=" +
          encodeURIComponent(data.token);

        iframe.setAttribute("title", "Support Chat");
        iframe.style.position = "fixed";
        iframe.style.bottom = "20px";
        iframe.style.right = "20px";
        iframe.style.width = "60px";
        iframe.style.height = "60px";
        iframe.style.border = "none";
        iframe.style.zIndex = "999999";
        iframe.style.borderRadius = "30px";

        iframe.style.backgroundColor = "transparent";
        iframe.style.transition = "all 0.3s ease";

        document.body.appendChild(iframe);

        window.addEventListener("message", function (event) {
          if (event.data.type === "resize") {
            iframe.style.width = event.data.width + "px";
            iframe.style.height = event.data.height + "px";
            iframe.style.borderRadius = event.data.borderRadius || "12px";

            if (event.data.boxShadow) {
              iframe.style.boxShadow = event.data.boxShadow;
            }
          }
        });
      }).catch(function(error){
        console.error("[K Xa Hajur] Error creating session:", error);
      });
  } catch (error) {
    console.error("[K Xa Hajur] Error initializing widget:", error);
  }
})();
