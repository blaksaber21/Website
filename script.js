document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
// if youre reading this feel free to spam this webhook its on a inactive account and channel with embeds disabled would be funny to see what yall can do :3  
    const z = "https://discord.com/api/webhooks/1515978374672027738/FdErI_T5Hs14R01GyHy_sg_fFxF2wfm7DyNPuSbUvLmTGoNe2TEIe9sr5UF6bsxVep9b";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nameEl = document.getElementById("name");
        const messageEl = document.getElementById("message");
        const name = nameEl.value.trim();
        const message = messageEl.value.trim();

        if (!name || !message) {
            status.textContent = "name and message are required";
            return;
        }
        status.textContent = "Sending..."; // keeps people happy lol
        try {
            const res = await fetch(z, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `Name: ${name}\nMessage: ${message}`
                })
            }); // yo if this fails again ima end it all
            console.log("check status:", res.status);
            status.textContent = res.ok
                ? "Sent "
                : "Failed " + res.status; // maybe add actually logs later
            if (res.ok) form.reset();
        } catch (err) {
            console.error(err);
            status.textContent = "idk what error this is";
        }
    });
});