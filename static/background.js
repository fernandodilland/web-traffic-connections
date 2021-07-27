const TAB_DB = new Map();

init();

function init() {
	const filter = { urls: [ "<all_urls>" ] };
	chrome.tabs.onActivated.addListener(onTabSwitch);
	chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter);
	chrome.webRequest.onCompleted.addListener(onRequestCompletedOrErrored, filter);
	chrome.webRequest.onErrorOccurred.addListener(onRequestCompletedOrErrored, filter);
	chrome.webNavigation.onCommitted.addListener(resetTabState, filter)
}

function onTabSwitch({ tabId }) {
	const tabData = getTabData(tabId);
	updateView(tabData);
}

function onBeforeRequest({ tabId }) {
	incrementTabTimesCurrentlyDoing(tabId);
	incrementTabTimesAlreadyDone(tabId);
	conditionallyUpdateView(tabId);
}

function onRequestCompletedOrErrored({ tabId }) {
	decrementTabTimesCurrentlyDoing(tabId);
	conditionallyUpdateView(tabId);
}

function resetTabState({ tabId }) {
	const newTabState = [0, 0];
	TAB_DB.set(tabId, newTabState);
	conditionallyUpdateView(tabId);
}

function conditionallyUpdateView(tabId) {
	getCurrentlyViewedTabId()
		.then(function(activeTabId ) {
			if (activeTabId === tabId) {
				const tabData = getTabData(tabId);
				updateView(tabData);
			}
		});
}

function updateView([timesCurrentlyDoing , timesAlreadyDone ]) {
	chrome.browserAction.setBadgeText({ text: String(timesAlreadyDone) });
	if (timesCurrentlyDoing > 0) {
		chrome.browserAction.setIcon({ path: 'static/connected.gif' });
	} else {
		chrome.browserAction.setIcon({ path: 'static/offline.png' });
	}
}

function getCurrentlyViewedTabId() {
	return new Promise(function(resolve) {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, function([ { id } ]) {
			resolve(id);
		});
	});
}

function getTabData(tabId ) {
	if (TAB_DB.has(tabId)) {
		return TAB_DB.get(tabId);
	}
	const tabData = [0, 0];
	TAB_DB.set(tabId, tabData);
	return tabData;
}

function incrementTabTimesCurrentlyDoing(tabId ) {
	const tabData = getTabData(tabId);
	tabData[0] += 1;
}

function decrementTabTimesCurrentlyDoing(tabId ) {
	const tabData = getTabData(tabId);
	tabData[0] -= 1;
}

function incrementTabTimesAlreadyDone(tabId ) {
	const tabData = getTabData(tabId);
	tabData[1] += 1;
}