const projects = [
    {
        title: "G-Split",
        description:
            "A Livesplit copy for Windows 10/11 that doesn't interact with the game at all, as well as a global hotkey function that works no matter what you're doing.",
        image: "/images/Gsplit.png",
        github: "https://github.com/whatisaOwen"
    },
    {
        title: "Plinko Replica",
        description:
            "A crappy built in 24hr Plinko Replica (No Canvas). Created for shits and giggles. All PNG based, can be used for content / trolls. Feel free to steal / laugh at the awful code.",
        image: "/images/Plinko.png",
        github: "https://github.com/whatisaOwen"
    },
];
const grid = document.getElementById("projectsGrid");
projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
        <img class="project-image"
             src="${project.image}"
             alt="${project.title}"
             onerror="this.src='/images/placeholder.png'">
        <div class="project-body">
            <div class="project-header">
                <h3 class="project-title">${project.title}</h3>
                <a href="${project.github}"
                   target="_blank"
                   class="project-source">
                    source
                </a>
            </div> 
            <p class="project-description">
                ${project.description}
            </p>
            <div class="project-tags">
                ${(project.tags || []).map(tag => `<span>${tag}</span>`).join("")}
            </div>
        </div>
    `;
    grid.appendChild(card);
});