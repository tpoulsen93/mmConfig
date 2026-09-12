Module.register("MMM-ThemeToggle", {
	defaults: {
		defaultTheme: "dark",
		storageKey: "magicmirror-theme",
		themes: {}
	},

	start () {
		this.themeNames = Object.keys(this.config.themes);
		const variableNames = new Set();

		this.themeNames.forEach((themeName) => {
			Object.keys(this.getThemeVariables(themeName)).forEach((variableName) => variableNames.add(variableName));
		});

		this.themeVariableNames = Array.from(variableNames);
		this.currentTheme = this.getInitialTheme();
		this.applyTheme(this.currentTheme);
	},

	notificationReceived (notification) {
		if (notification === "DOM_OBJECTS_CREATED") {
			this.applyTheme(this.currentTheme);
			this.updateDom(0);
		}
	},

	getDom () {
		const wrapper = document.createElement("div");
		wrapper.className = "theme-toggle-shell";

		const button = document.createElement("button");
		button.type = "button";
		button.className = "theme-toggle-button";
		button.addEventListener("click", () => {
			this.toggleTheme();
		});

		const nextThemeName = this.getNextThemeName();
		const nextTheme = this.config.themes[nextThemeName] || {};
		const icon = document.createElement("span");
		icon.className = `theme-toggle-icon fa-solid fa-${nextTheme.buttonIcon || "circle-half-stroke"}`;
		button.append(icon);

		const label = document.createElement("span");
		label.className = "theme-toggle-label";
		label.innerText = nextTheme.buttonText || "Theme";
		button.append(label);

		const ariaLabel = nextTheme.buttonLabel || `Switch to ${nextThemeName} mode`;
		button.setAttribute("aria-label", ariaLabel);
		button.title = ariaLabel;

		wrapper.append(button);
		return wrapper;
	},

	getInitialTheme () {
		const fallbackTheme = this.config.themes[this.config.defaultTheme]
			? this.config.defaultTheme
			: this.themeNames[0] || "dark";

		try {
			const savedTheme = localStorage.getItem(this.config.storageKey);
			if (savedTheme && this.config.themes[savedTheme]) {
				return savedTheme;
			}
		} catch (error) {
			Log.debug(`${this.name} could not read theme from storage.`, error);
		}

		return fallbackTheme;
	},

	getThemeVariables (themeName) {
		const theme = this.config.themes[themeName] || {};
		return theme.variables || {};
	},

	getNextThemeName () {
		if (this.themeNames.length < 2) {
			return this.currentTheme;
		}

		const currentIndex = this.themeNames.indexOf(this.currentTheme);
		const nextIndex = (currentIndex + 1) % this.themeNames.length;
		return this.themeNames[nextIndex];
	},

	toggleTheme () {
		if (this.themeNames.length < 2) {
			return;
		}

		this.currentTheme = this.getNextThemeName();
		this.applyTheme(this.currentTheme);
		this.updateDom(0);
	},

	applyTheme (themeName) {
		const root = document.documentElement;
		root.setAttribute("data-theme", themeName);

		this.themeVariableNames.forEach((variableName) => {
			root.style.removeProperty(variableName);
		});

		Object.entries(this.getThemeVariables(themeName)).forEach(([variableName, value]) => {
			root.style.setProperty(variableName, value);
		});

		try {
			localStorage.setItem(this.config.storageKey, themeName);
		} catch (error) {
			Log.debug(`${this.name} could not persist theme to storage.`, error);
		}
	}
});
