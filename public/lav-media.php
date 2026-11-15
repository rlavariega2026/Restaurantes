<?php
declare(strict_types=1);
require_once __DIR__.'/lav-security.php';
$root=lav_store(); $media=$root.'/media';
if(!is_dir($media) && !mkdir($media,0755,true) && !is_dir($media))lav_reply(['error'=>'No se pudo preparar el almacén de fotografías'],500);
if(($_SERVER['REQUEST_METHOD']??'GET')==='GET'){
  $name=(string)($_GET['file']??'');
  if(!preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|gif|avif)$/',$name)) { http_response_code(404);exit; }
  $file=$media.'/'.$name;
  if(!is_file($file)){http_response_code(404);exit;}
  // Private drafts remain private. Public media must be used by a published restaurant.
  if(!lav_current()){
    $cards=$root.'/restaurants.json';$allowed=false;
    $list=is_file($cards)?json_decode((string)file_get_contents($cards),true):[];
    foreach(is_array($list)?$list:[] as $restaurant){
      if(empty($restaurant['hostingerConfig']['published']))continue;
      if(str_contains(json_encode($restaurant,JSON_UNESCAPED_SLASHES),$name)){$allowed=true;break;}
    }
    if(!$allowed){http_response_code(403);exit;}
  }
  $mime=(new finfo(FILEINFO_MIME_TYPE))->file($file);
  header('Content-Type: '.($mime?:'application/octet-stream'));
  header('Cache-Control: public, max-age=86400');
  header('X-Content-Type-Options: nosniff');readfile($file);exit;
}
lav_require();
if(($_SERVER['REQUEST_METHOD']??'')!=='POST')lav_reply(['error'=>'Método inválido'],405);
$upload=(string)($_POST['uploadId']??'');$index=filter_var($_POST['index']??null,FILTER_VALIDATE_INT);
$total=filter_var($_POST['total']??null,FILTER_VALIDATE_INT);
$expected=filter_var($_POST['size']??null,FILTER_VALIDATE_INT);
if(!preg_match('/^[a-f0-9-]{16,64}$/',$upload)||$index===false||$total===false||$expected===false||$total<1||$index<0||$index>=$total||$total>100000)
  lav_reply(['error'=>'Identificador de carga inválido'],422);
if(!isset($_FILES['part'])||($_FILES['part']['error']??1)!==UPLOAD_ERR_OK)lav_reply(['error'=>'Bloque no recibido por el servidor'],413);
$temp=$root.'/media-parts';
if(!is_dir($temp) && !mkdir($temp,0750,true) && !is_dir($temp))lav_reply(['error'=>'No se pudo preparar carga temporal'],500);
$partPath=$temp.'/'.$upload.'.'.$index;
if(!move_uploaded_file((string)$_FILES['part']['tmp_name'],$partPath))lav_reply(['error'=>'No se pudo guardar el bloque'],500);
if($index!==$total-1)lav_reply(['success'=>true,'received'=>$index]);
$mimeMap=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif','image/avif'=>'avif'];
$tmp=$temp.'/'.$upload.'.joined';$out=fopen($tmp,'wb');if(!$out)lav_reply(['error'=>'No se pudo crear imagen'],500);
$bytes=0;
for($i=0;$i<$total;$i++){
  $part=$temp.'/'.$upload.'.'.$i;
  if(!is_file($part)){fclose($out);@unlink($tmp);lav_reply(['error'=>'Falta el bloque '.$i],409);}
  $in=fopen($part,'rb');if(!$in){fclose($out);@unlink($tmp);lav_reply(['error'=>'Bloque ilegible'],500);}
  $n=stream_copy_to_stream($in,$out);$bytes+=$n===false?0:$n;fclose($in);
}
fclose($out);
if($bytes!==$expected){@unlink($tmp);lav_reply(['error'=>'La imagen quedó incompleta; no se publicó'],422);}
$mime=(new finfo(FILEINFO_MIME_TYPE))->file($tmp);
if(!isset($mimeMap[$mime])){@unlink($tmp);lav_reply(['error'=>'Formato de imagen no admitido'],415);}
$name=bin2hex(random_bytes(16)).'.'.$mimeMap[$mime];
if(!rename($tmp,$media.'/'.$name))lav_reply(['error'=>'No se pudo finalizar la imagen'],500);
for($i=0;$i<$total;$i++)@unlink($temp.'/'.$upload.'.'.$i);
lav_reply(['success'=>true,'url'=>'/Restaurantes/lav-media.php?file='.$name,'size'=>$bytes,'mime'=>$mime],201);
