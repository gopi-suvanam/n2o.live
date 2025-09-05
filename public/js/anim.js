function createHeart() {
  an=an+1;
  var cn;
  if(an%3==0)
    cn ='animate0';
  else if (an%3==1)
    cn='animate1';
  else
    cn='animate2';
  newdiv=document.createElement('div');
  newdiv.id = an;
  newdiv.className = cn;
  newdiv.style.bottom = '30px';
  newdiv.style.right = '30px';
  document.body.appendChild(newdiv);
  myMove(an);
}


function myMove(id) {
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;


  var elem = document.getElementById(id);

  var postop = y-100;
  var posright=x-100;
  var hitflag=0;
  var id = setInterval(frame, 10);
  function frame() {
    if(postop-(y/2)==100)
        fadeelem(elem);
    if (postop<=(y/2))
        {
      elem.parentNode.removeChild(elem);
      clearInterval(id);
    }
     else {
      postop--;
      if(hitflag==0)
      posright--;
      else
      posright++;
      if(posright==(x-125))
        hitflag=1;
      if(posright==(x-100))
        hitflag=0;
      elem.style.top = postop + 'px';
      elem.style.left = posright + 'px';


    }
  }
}
function fadeelem(elem)
{
  $(elem).fadeOut("slow");
}

