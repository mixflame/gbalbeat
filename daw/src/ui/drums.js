"use strict";

window.UIdrumsInit = function() {
	const win = UIwindows.window( "drums" );

	UIdrums.setDAWCore( DAW );
	UIdrums.rootElement.setPxPerBeat( 120 );
	UIdrums.setWaveforms( UIpatterns.svgForms.bufferHD );
	UIdrums.rootElement.onfocus = () => DAW.drumsFocus();
	DOM.drumsName.onclick = UIdrumsNameClick;
	win.onfocusin = UIdrumsWindowFocusin;
	win.contentAppend( UIdrums.rootElement );
}

window.UIdrumsWindowFocusin = function( e ) {
	if ( !UIdrums.rootElement.contains( e.target ) ) {
		UIdrums.rootElement.focus();
	}
}

window.UIdrumsNameClick = function() {
	const id = DAW.get.patternDrumsOpened(),
		name = DOM.drumsName.textContent;

	gsuiPopup.prompt( "Rename pattern", "", name, "Rename" )
		.then( name => DAW.callAction( "renamePattern", id, name ) );
}
