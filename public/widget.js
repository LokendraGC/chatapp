(function () {
  try {
    const script = document.currentScript;

    if (!script) {
      return;
    }

    var widgetID = script.getAttribute("data-id");
    if (!widgetID || widgetID.trim() === "") {
      console.error("[Sahayak] Widget ID is required");
      return;
    }

    // Base URL = where this script was loaded from (so API/embed use same host)
    var baseUrl = "";
    try {
      baseUrl = new URL(script.src).origin;
    } catch (e) {
      console.error("[Sahayak] Could not get script origin", e);
      return;
    }

    fetch(baseUrl + "/api/widget/session", {
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
          baseUrl + "/embed?token=" +
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
        iframe.style.overflow = "hidden";
        iframe.style.backgroundColor = "transparent";
        iframe.style.transition = "all 0.3s ease";

        document.body.appendChild(iframe);

        window.addEventListener("message", function (event) {
          if (event.data && event.data.type === "resize") {
            iframe.style.width = event.data.width;
            iframe.style.height = event.data.height;
            iframe.style.borderRadius = event.data.borderRadius || "12px";

            if (event.data.boxShadow) {
              iframe.style.boxShadow = event.data.boxShadow;
            }

            var isMobile = window.innerWidth <= 768;
            var isExpanded = event.data.width === "380px" || parseInt(event.data.width, 10) >= 300;

            if (isMobile && isExpanded) {
              iframe.style.left = "50%";
              iframe.style.top = "50%";
              iframe.style.transform = "translate(-50%, -50%)";
              iframe.style.right = "auto";
              iframe.style.bottom = "auto";
            } else {
              iframe.style.left = "auto";
              iframe.style.top = "auto";
              iframe.style.transform = "none";
              iframe.style.right = "20px";
              iframe.style.bottom = "20px";
            }
          }
        });
      }).catch(function(error){
        console.error("[Sahayak] Error creating session:", error);
      });
  } catch (error) {
    console.error("[Sahayak] Error initializing widget:", error);
  }
})();
