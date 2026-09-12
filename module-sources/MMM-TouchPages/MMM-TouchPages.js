Module.register("MMM-TouchPages", {
	start () {
		this.commandsRegistered = false;
		this.currentPage = 0;
	},

	notificationReceived (notification, payload) {
		if (notification === "NEW_PAGE" || notification === "PAGE_NUMBER_IS") {
			if (Number.isInteger(payload)) {
				this.currentPage = payload;
			}
			return;
		}

		if (notification !== "DOM_OBJECTS_CREATED" || this.commandsRegistered) {
			return;
		}

		this.commandsRegistered = true;
		this.registerCommand("SWIPE_LEFT_1", (commander) => {
			this.navigateCalendar(commander, 1);
		});

		this.registerCommand("SWIPE_RIGHT_1", (commander) => {
			this.navigateCalendar(commander, -1);
		});

		this.registerCommand("DOUBLE_TAP_1", (commander) => {
			this.resetCalendar(commander);
		});

		this.registerCommand("DOUBLE_TAP_2", () => {
			this.refreshPage();
		});

		this.registerCommand("SWIPE_LEFT_2", (commander) => {
			commander.sendNotification("PAGE_INCREMENT");
		});

		this.registerCommand("SWIPE_RIGHT_2", (commander) => {
			commander.sendNotification("PAGE_DECREMENT");
		});

		this.sendNotification("QUERY_PAGE_NUMBER");
	},

	registerCommand (gesture, func) {
		this.sendNotification("TOUCH_REGISTER_COMMAND", {
			mode: "default",
			gesture,
			func
		});
	},

	navigateCalendar (commander, direction) {
		if (this.currentPage !== 0) {
			return;
		}

		this.shiftCalendarView(commander, "mainCalendar", "monthIndex", direction);
	},

	resetCalendar (commander) {
		if (this.currentPage !== 0) {
			return;
		}

		commander.sendNotification("CX3_RESET", { instanceId: "mainCalendar" });
	},

	refreshPage () {
		window.location.reload();
	},

	shiftCalendarView (commander, instanceId, key, direction) {
		commander.sendNotification("CX3_GET_CONFIG", {
			instanceId,
			callback: (currentConfig) => {
				const nextValue = (currentConfig?.[key] ?? 0) + direction;

				commander.sendNotification("CX3_SET_CONFIG", {
					instanceId,
					[key]: nextValue
				});
			}
		});
	}
});
