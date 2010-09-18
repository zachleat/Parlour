<?php
define('PARLOUR_PAGE_TITLE', 'Gallery Title');
define('PARLOUR_FLICKR_POOL_ID', 'SPECIFY THIS');
define('PARLOUR_FLICKR_API_KEY', 'SPECIFY THIS TOO');

define('PARLOUR_CACHE_FILE', 'flickr_cache/cache.php');
define('PARLOUR_MAX_IMAGES', 50); // paging not implemented.
define('PARLOUR_MAX_CACHE_TIME', 60*60*24); // 24 hours

include_once('Zend/Service/Flickr.php');
$flickr = new Zend_Service_Flickr(PARLOUR_FLICKR_API_KEY);
?><!doctype html>
<html>
<head>
    <title><?php echo PARLOUR_PAGE_TITLE; ?></title>
    <link type="text/css" rel="stylesheet" href="index.css"></link>
</head>
<body>
    <div id="album" class="ui-helper-clearfix">
        <div id="title">
            <?php echo PARLOUR_PAGE_TITLE; ?>
        </div>
<?php
    $fileName = PARLOUR_CACHE_FILE;
    try {
    	$modificationDifference = time() - filemtime($fileName);
    	echo '<!-- Time since last modification: ' . $modificationDifference . ' out of ' . PARLOUR_MAX_CACHE_TIME . '-->';
    	if($modificationDifference < PARLOUR_MAX_CACHE_TIME) { // 24 hours
    		include $fileName;
    	} else {
    		//$results = $flickr->userSearch('user@example.com', array('per_page' => PARLOUR_MAX_IMAGES));
            //$results = $flickr->tagSearch('sometag', array('per_page' => PARLOUR_MAX_IMAGES));
            $results = $flickr->groupPoolGetPhotos(PARLOUR_FLICKR_POOL_ID, array('per_page' => PARLOUR_MAX_IMAGES));

            ob_start();
			echo '<!-- dynamically generated -->';
			echo '<!--' . print_r($results, TRUE) . '-->';
		    foreach ($results as $result) {
			    $small = $result->Small;
			    $large = $result->Large;
?>
		        <div class="frame" name="<?php echo $result->id; ?>" fullscreen-photo="<?php echo $large->uri; ?>" fullscreen-width="<?php echo $large->width; ?>" fullscreen-height="<?php echo $large->height; ?>">
		            <div class="border">
			            <div class="photo">
			                <a href="http://www.flickr.com/photos/<?php echo $result->owner . '/' . $result->id; ?>"><img src="<?php echo $small->uri; ?>" style="width: <?php echo $small->width; ?>px; height: <?php echo $small->height; ?>px;"/></a>
			            </div>
			            <div class="label"><?php echo $result->title; ?></div>
		             </div>
		        </div>
<?php
	        }

	        $content = ob_get_contents();
	        ob_end_flush();
	        //file_put_contents($fileName, $content);
    	}
    } catch(Exception $e) {
    	include $fileName;
    	echo '<!-- There was an error fetching the content, using the cached version. -->';
    }
?>
    </div>
    <div id="previous" class="arrow">&lt;</div>
    <div id="next" class="arrow">&gt;</div>
    <script src="http://www.google.com/jsapi" type="text/javascript"></script>
    <script src="index.js" type="text/javascript"></script>
</body>
</html>