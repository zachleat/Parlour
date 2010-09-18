// TODO
// 	onhashchange
google.load('jquery', '1.4.2');
google.setOnLoadCallback(function()
{
    var PREV_PRELOAD_THRESHOLD = 2,
    	NEXT_PRELOAD_THRESHOLD = 2,
    	counter = 0,
    	loaded = {},
    	pluginsLoaded = {},
    	currentlyScrolling = 0;

    $.getFrameByPhotoId = function(id)
    {
    	return $('div.frame' + (id ? '[name='+id+']' : '')).eq(0).not('#title');
    };

    $.getNextFrame = function()
    {
    	return $('div.active-frame').next();
    };

    $.getPreviousFrame = function()
    {
    	return $('div.active-frame').prev();
    };

    function customScrollTo(left, top)
    {
		$(document).scrollTo({left: left, top: top}, 500,
		{
			onAfter: function()
			{
				window.setTimeout(function()
				{
					currentlyScrolling--;
				}, 100);
			}
		});
    }

    $(document).keypress(function(event)
	{
    	var key = event.which,
    		el;

    	if(key == 106 || key == 74) { // j or J
    		el = $.getPreviousFrame();
    		$('#previous').click();
    	} else if(key == 107 || key == 75) { // k or K
    		el = $.getNextFrame();
    		$('#next').click();
    	}
    	if(el && el.length) {
    		currentlyScrolling++;

    		var left = Math.max(el.offset().left - $(window).width() / 2 + el.width() / 2, 0);
    		if(pluginsLoaded.scrollTo) {
    			customScrollTo(left, 0);
        	} else {
        		$.getScript('jquery.scrollTo-min.js', function()
    		    {
    		  		pluginsLoaded.scrollTo = true;
    		  		customScrollTo(left, 0);
    		    });
        	}
    	}
	});/*.bind('hashchange', function(event)
	{
		//console.log(document.location.hash);
//		$.getFrameByPhotoId(document.location.hash.substr(1)).click();
	});*/

    $('#previous').click(function()
	{
    	$.getPreviousFrame().click();
	});

    $('#next').click(function()
	{
    	$.getNextFrame().click();
	});

    $('a').live('click', function(event)
    {
    	event.preventDefault();
    });

    $('img.fullscreen-toggle').live('click', function(event)
	{
    	$(event.target).toggleClass('fullscreen-byheight');
	});

    function getImageByFrame(frame)
    {
    	var $frame = $(frame);
    	if(!frame || !$frame.length || !$frame.is('div.frame')) {
    		return $([]);
    	}

    	var width = parseInt($frame.attr('fullscreen-width'), 10),
	    	height = parseInt($frame.attr('fullscreen-height'), 10);

    	return getImage($frame.attr('name'), $frame.attr('fullscreen-photo'), width, height);
    }

    function getImage(id, src, width, height)
    {
    	if(loaded[id]) {
    		return $('#photo-' + id);
    	}

    	var heightclass = height > width || (width / height) >= ($(window).width() / $(window).height()) ? '' : 'fullscreen-toggle';

    	loaded[id] = true;

    	return $('<img/>').attr({
	            id: 'photo-' + id,
	            src: src
	        })
	        .addClass('fullscreen-photo fullscreen-byheight ' + heightclass)
	        .load(function()
	            {
	                $('#lowsrc-' + id).remove();
	            })
	        .error(function()
				{
	        		delete loaded[id];
	        		$('#lowsrc-' + id).remove();
	            	$(this).remove();
	            })
            .appendTo(document.body);
    }

    $('div.frame').live('click', function(event)
    {
    	if(event.button == 2) {
    		return;
    	}

        var $frame = $(event.target).closest('div.frame'),
            id = $frame.attr('name');

        $('img.fullscreen-photo').fadeOut(400);
        $('.active-frame').removeClass('active-frame');
        $frame.addClass('active-frame');

        if(!id) {
        	return;
        }

        $('#next')[$frame.next().not('#title').length ? 'removeClass' : 'addClass']('arrow-disabled');
        $('#previous')[$frame.prev().not('#title').length ? 'removeClass' : 'addClass']('arrow-disabled');

        document.location.hash = id;

        $('.fullscreen-lowsrc').remove();

        if(loaded[id]) {
            $('#photo-' + id).fadeIn(800);
        } else {
            var $img = getImageByFrame($frame[0]),
                $lowsrcimg = $('<img/>').attr({
                        id: 'lowsrc-' + id,
                        src: $frame.find('img').attr('src')
                    }).addClass('fullscreen-lowsrc fullscreen-byheight');

            $lowsrcimg.appendTo(document.body).show();
            $img.show();
        }

        var $el = $frame;
        for(var j=0, k=PREV_PRELOAD_THRESHOLD; j<k; j++) {
        	$el = $el.prev();
            getImageByFrame($el[0]);
        }

        $el = $frame;
        for(var j=0, k=NEXT_PRELOAD_THRESHOLD; j<k; j++) {
        	$el = $el.next();
            getImageByFrame($el[0]);
        }
    });

    // onload picture.
  	$.getFrameByPhotoId(document.location.hash.substr(1)).click();

  	$('#share').click(function()
	{
  		$('a.addthis_button_compact').click();
	});

  	$.getScript('jquery.hoverflow.min.js', function()
    {
        var timeout;

        function showMenu(e, options)
        {
        	if(timeout) {
                window.clearTimeout(timeout);
            }

        	var options = $.extend({
        		duration: 300
        	}, options || {});

        	$('#album').hoverFlow(e.type, {
                top: 0
            }, options);
        }

        function resetMenu(e)
        {
        	if(timeout) {
                window.clearTimeout(timeout);
            }

        	if($('#title').is('.active-frame')) {
        		return;
        	}

        	timeout = window.setTimeout(function()
            {
        		$('#album').hoverFlow(e.type, {
            		top: '-180px'
                }, 1000);
            }, 450);
        }

      	$(document).scroll(function(e)
    	{
        	if(currentlyScrolling) {
        		return;
        	}

      		showMenu({type: 'mouseenter'}, {
      			complete: function()
      			{
      				window.setTimeout(function()
    				{
      					resetMenu({type: 'mouseleave'});
    				}, 100);
      			}
      		});
    	});

        $('#album').mouseenter(showMenu).mouseleave(resetMenu).mouseleave();
    });
});