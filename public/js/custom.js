jQuery(window).load(function($) {
	"use strict";
	//Loader
	jQuery('#preloader-1,#preloader-2').fadeOut('2000');
	jQuery('body').css('overflow', 'auto');

	// End of Loader
	var windowWidth  = jQuery(window).width();	
	if(windowWidth > 1024){

		// Banner Animations
		var animation1 = setInterval(function(){
			jQuery('.logo-outter.top-optc').animate({opacity: 1, top: 0}, 500);
			clearInterval(animation1);
		}, 300);

		var animation2 = setInterval(function(){ 
			jQuery('.form-outter').css('visibility', 'visible').addClass('animated  fadeInUp');
			clearInterval(animation2); 			
		}, 700);

		var animation3 = setInterval(function(){ 
			jQuery('.header-txt-inner h1.top-optc').animate({opacity: 1, top: 0}, 500);
			jQuery('.header-txt-inner h2.top-optc').animate({opacity: 1, top: 0}, 900);
			jQuery('.header-txt-inner p.top-optc').animate({opacity: 1, top: 0}, 1500);
			jQuery('.header-txt-inner button.top-optc').animate({opacity: 1, top: 0}, 500);
			clearInterval(animation3); 
		}, 1800); 
		// End of Banner Animations

	} 
}); 
jQuery(document).ready(function($) {
	//Contact form validations
	jQuery("#requestform").validate({
		rules: {     
			fullname: {required: true},
			email: {required: true, email: true},
			pnumber: {required: true, number: true},
			state: {required: true}
		},
		tooltip_options: {
			fullname: {trigger:'focus'},
			email: {trigger:'focus'},			
			pnumber: {trigger:'focus'},
			state: {trigger:'focus'}
		},
		tooltip_options: {
           thefield: { placement: 'top' }
        },
		submitHandler: function(form) {  
			$.ajax({
			   type: "POST",
			   url:'contact-form.php',
			   data: $("#requestform").serialize(), // serializes the form's elements. $(this).serializeArray();
			   success: function(data)
			   {
				  if(data==1){  
					 $('.form-wrapper .alert').show(); 
					  $('input[name="fullname"]').val(''); 
					  $('input[name="email"]').val(''); 
					  $('input[name="pnumber"]').val(''); 					  
					  $('#requestform select option:first-child').prop('selected', true);
					   	setTimeout(function () {  
					    	$('.form-wrapper .alert').hide(); 
						}, 10000);
				  }
			   }
			 }); 
			$("#validity_label").html('<div class="alert alert-success">No errors.  Like a boss.</div>');
		},
		invalidHandler: function(form, validator) {
			$("#validity_label").html('<div class="alert alert-error">There be '+validator.numberOfInvalids()+' error'+(validator.numberOfInvalids()>1?'s':'')+' here.  OH NOES!!!!!</div>');
		}
	});

	//Contact form validations
	$("#contactform").validate({
		rules: {     
			fullname: {required: true},
			email: {required: true, email: true},
			pnumber: {required: true, number: true},
			state: {required: true}
		},
		tooltip_options: {
			fullname: {trigger:'focus'},
			email: {trigger:'focus'},			
			pnumber: {trigger:'focus'},
			state: {trigger:'focus'}
		},
		tooltip_options: {
           thefield: { placement: 'top' }
        },
		submitHandler: function(form) {  
			$.ajax({
			   type: "POST",
			   url:'contact-form.php',
			   data: $("#contactform").serialize(), // serializes the form's elements. $(this).serializeArray();
			   success: function(data)
			   {
				  if(data==1){  
					  $('#successModal').modal('show'); 
					  $('input[name="fullname"]').val(''); 
					  $('input[name="email"]').val(''); 
					  $('input[name="pnumber"]').val(''); 					  
					  $('#contactform select option:first-child').prop('selected', true);
					   	setTimeout(function () {  
					    	$('#successModal').modal('hide');
						}, 10000);
				  }
			   }
			 }); 
			$("#validity_label").html('<div class="alert alert-success">No errors.  Like a boss.</div>');
		},
		invalidHandler: function(form, validator) {
			$("#validity_label").html('<div class="alert alert-error">There be '+validator.numberOfInvalids()+' error'+(validator.numberOfInvalids()>1?'s':'')+' here.  OH NOES!!!!!</div>');
		}
	}); 
});