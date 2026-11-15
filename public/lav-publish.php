<?php
declare(strict_types=1);
require_once __DIR__.'/lav-security.php';
lav_require();
if(($_SERVER['REQUEST_METHOD']??'')!=='POST')lav_reply(['error'=>'Método no permitido'],405);
$input=json_decode((string)file_get_contents('php://input'),true);
if(!is_array($input))lav_reply(['error'=>'Solicitud inválida'],400);
$client=(string)($input['clientFolder']??'');
$publication=(string)($input['publicationFolder']??'');
$mode=(string)($input['mode']??'');
foreach([$client,$publication] as $component){
  if(!preg_match('/^[a-z0-9][a-z0-9_-]{0,49}$/',$component))lav_reply(['error'=>'Nombre de carpeta inválido'],422);
}
if(!in_array($mode,['demo','final'],true))lav_reply(['error'=>'Tipo de publicación inválido'],422);
// Never let a customer publication occupy application service directories or another customer's URL.
if(in_array($client,['api','admin','assets','public','src','dist','server','data'],true)) lav_reply(['error'=>'Carpeta reservada por la aplicación'],422);
$restaurantId=(string)($input['restaurantId']??'');
if($restaurantId==='')lav_reply(['error'=>'Falta el identificador del restaurante'],422);
$records=lav_store().'/restaurants.json';
$existing=is_file($records)?json_decode((string)file_get_contents($records),true):[];
foreach(is_array($existing)?$existing:[] as $record){
  if(($record['hostingerConfig']['publicationPath']??'')===$client.'/'.$publication && ($record['id']??'')!==$restaurantId)
    lav_reply(['error'=>'Esta dirección ya pertenece a otro restaurante; elige otra carpeta'],409);
}
$dir=__DIR__.'/'.$client.'/'.$publication;
$parent=__DIR__.'/'.$client;
if(!is_dir($parent)&&!mkdir($parent,0755,true)&&!is_dir($parent))lav_reply(['error'=>'No se pudo crear carpeta de cliente'],500);
if(!is_dir($dir)&&!mkdir($dir,0755,true)&&!is_dir($dir))lav_reply(['error'=>'No se pudo crear carpeta de publicación'],500);
$index=$dir.'/index.php';
if(file_exists($index) && strpos((string)file_get_contents($index),'LAV_RESTAURANTES_PUBLICATION')===false)
  lav_reply(['error'=>'Ya existe una publicación externa en esa dirección; no se sobrescribirá'],409);
// The root compiled SPA handles card rendering. This leaves full restaurant data
// in protected server JSON, while preserving the exact published folder URL.
$source="<?php\n/* LAV_RESTAURANTES_PUBLICATION */\nheader('Cache-Control: no-cache, max-age=0');\nreadfile(dirname(__DIR__,2).'/index.html');\n";
$tmp=$index.'.tmp.'.bin2hex(random_bytes(6));
if(file_put_contents($tmp,$source,LOCK_EX)===false || !rename($tmp,$index))lav_reply(['error'=>'No se pudo crear la publicación'],500);
$url='https://lavdigitalagency.com/Restaurantes/'.$client.'/'.$publication.'/';
lav_reply(['success'=>true,'url'=>$url,'publicationPath'=>$client.'/'.$publication,'mode'=>$mode]);
