#!/usr/bin/php
<?php

/**
 * Get MediaWiki userinfo
 *
 * Try to login with the provided data and return
 * current content migration data to move over.
 *
 * Original author: http://www.mediawiki.org/wiki/User:Krinkle/API_PHP_cURL_example
 *
 * Changed to return a JSON object string to confirm whether there is a user
 * or not and adjusted error messages logic.
 */

//die(var_dump($argv));

/**
 *  Configuration
 * -------------------------------------------------
 */
// Start session
session_start();

$app['username'] = $argv[1];
$app['password'] = $argv[2];
$app["apiURL"] =   'https://ssl.webplatform.org/api/docs';

// Creating errors array
$app['errors'] = null;

// Version
$app["version"] = "0.0.2-dev";

// Last modified
date_default_timezone_set("UTC");
$app["lastmod"] = date("Y-m-d H:i", getlastmod()) . " UTC"; // Example: 2010-04-15 18:09 UTC

// User-Agent used for loading external resources
$app["useragent"] = "WebPlatform Accounts Migration Client " . $app["version"] . " (LastModified: " . $app["lastmod"] . ") Contact: renoir@w3.or";

// Cookie file for the session

$app["cookiefile"] = tempnam("/tmp", "CURLCOOKIE");

// cURL to avoid repeating ourselfs
$app["curloptions"] =
  array(
    CURLOPT_COOKIEFILE => $app["cookiefile"],
    CURLOPT_COOKIEJAR => $app["cookiefile"],
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_USERAGENT => $app["useragent"],
    CURLOPT_POST => true
  );

/**
 *  Login
 * -------------------------------------------------
 */

// Info: http://www.mediawiki.org/wiki/API:Login
$postdata = "action=login&format=php&lgname=migration_script&lgpassword=inuseful_call_to_get_a_token"; // . 'lgname=' . $app["username"] . "&lgpassword=" . $app["password"];

$ch = curl_init();
  curl_setopt_array($ch, $app["curloptions"]);
  curl_setopt($ch, CURLOPT_URL, $app["apiURL"]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
  $result = unserialize(curl_exec($ch));
  if(curl_errno($ch)){
      $curl_error = "Error 003: " . curl_error($ch);
  }
curl_close($ch);
//print_r($postdata);print_r($result);//die;//DEBUG

// Basic error check + Confirm token
if ($curl_error){
  $errors[] = $curl_error;

} else if ($result["login"]["result"] == "NeedToken") {

  if (!empty($result["login"]["token"])) {
    $_SESSION["logintoken"] = $result["login"]["token"];

    $postdata = "action=login&format=php&lgname=" . $app["username"] . "&lgpassword=" . $app["password"] . "&lgtoken=" . $_SESSION["logintoken"];

    $ch = curl_init();
      curl_setopt_array($ch, $app["curloptions"]);
      curl_setopt($ch, CURLOPT_URL, $app["apiURL"]);
      curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
      $result = unserialize(curl_exec($ch));
      if(curl_errno($ch)){
          $curl_error =  "Error 004: " . curl_error($ch);
      }
    curl_close($ch);
    //print_r($postdata);print_r($result);//die;//DEBUG

  } else {
    $errors[] = "Error 006: Communication problem with the backend (Token error).";
  }

}

// Check for all documented errors
// Source: http://www.mediawiki.org/wiki/API:Login#Errors
// Date: 2010-04-17
if ($curl_error){
  $errors[] = $curl_error;

} else if ($result["login"]["result"] == "Success") {
  $_SESSION["login_result"] = $result["login"]["result"];
  $_SESSION["login_lguserid"] = $result["login"]["lguserid"];
  $_SESSION["login_lgusername"] = $result["login"]["lgusername"];

} else if ($result["login"]["result"] == "NeedToken") {
  $errors[] = "Error 005: Communication problem with the backend (Missing token?).";

} else if ($result["login"]["result"] == "NoName") {
  $errors[] =  "The username can not be blank";

} else if ($result["login"]["result"] == "Illegal") {
  $errors[] =  "You provided an illegal username";

} else if ($result["login"]["result"] == "NotExists") {
  $errors[] =  "The username you provided doesn't exist";

} else if ($result["login"]["result"] == "EmptyPass") {
  $errors[] =  "The password can not be blank";

} else if ($result["login"]["result"] == "WrongPass" || $result["login"]["result"] == "WrongPluginPass") {
  $errors[] =  "Problem with migration, the account exists, but the provided password is incorrect";

} else if ($result["login"]["result"] == "CreateBlocked") {
  $errors[] =  "Autocreation was blocked from this IP address";

} else if ($result["login"]["result"] == "Throttled") {
  $errors[] =  "Communication problem with the backend: You've logged in too many times in a short time. Try again later.";

} else if ($result["login"]["result"] == "mustbeposted") {
  $errors[] =  "Error 004: Logindata was not send correctly";

} else if ($result["login"]["result"] == "Blocked") {
  $errors[] =  "Problem with migration, the account exists, but it has been blocked. Please report by e-mail BLOCKED_REPORT_URL.";

} else if ($result["login"]["result"]){
  $errors[] = "Error 001: An unknown event occurred.";
} else {
  $errors[] = "Error 002: An unknown event occurred.";
}

//
// Exiting. It either failed, return error messages
//   or return the desired data. All of the above in a
//   nice and tidy JSON object.
//
if($_SESSION["login_result"] !== "Success"){
  $output = json_encode(array_merge(array('success'=>false, 'messages'=>$errors)), true);
} else {

  /**
   *  Get userinfo (what we came here for)
   * -------------------------------------------------
   */

  $postdata = "action=query&format=php&meta=userinfo&uiprop=realname|email";

  $ch = curl_init();
  curl_setopt_array($ch, $app["curloptions"]);
  curl_setopt($ch, CURLOPT_URL, $app["apiURL"]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
  $result = unserialize(curl_exec($ch));
  if(curl_errno($ch)){
      $errors[] = "Error 003: " . curl_error($ch) . "API connection failed.";
  }
  curl_close($ch);
  //print_r($result);//die;//DEBUG

  $output = json_encode(array_merge(array('success'=>true),array('data'=> $result['query']['userinfo'])), true);
}

/**
 *  Exit protocol
 * -------------------------------------------------
 */

// Delete the cookie file
unlink($app["cookiefile"]);

// Destroy the session
session_destroy();

//var_dump($_SESSION);
//unset($_SESSION);

// End this file
die($output);
