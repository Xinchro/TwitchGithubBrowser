var twitch = window.Twitch.ext

var dirs = []

twitch.onAuthorized(authenticated)
twitch.configuration.onChanged(loadData)

function authenticated(auth) {
  
}

function loadData() {
  setVars(twitch.configuration)
  browseNext(false, '')
}

function setVars(data) {
  console.log(data)
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
    console.log(broadcaster)
  } catch(e) {
    var broadcaster = { username: "error", repo: "error" }
  }

  repoURL = "//github.com/"+broadcaster.user+"/"+broadcaster.repo+"/"
  URL = "//api.github.com/repos/"+broadcaster.user+"/"+broadcaster.repo+"/contents/"

  document.getElementById("user").href = "//github.com/"+broadcaster.user
  document.getElementById("repo").href = "//github.com/"+broadcaster.user+"/"+broadcaster.repo
  Array.from(document.getElementsByClassName("nav-item")).forEach(function(ele) {ele.target="_blank"})
}

function goBack() {
  dirs.pop()
  browseNext(false, '')
}

document.getElementById('goBack-btn').addEventListener('click', function() {
  goBack()
})

function browseNext(event, newDir) {
  if(event) event.preventDefault()
  
  if(newDir !== '') dirs.push(newDir)
  console.log("browsing", dirs)
  
  var xhttp = new XMLHttpRequest()
  xhttp.open("GET", URL + dirs.join('/'), false)
  xhttp.send()
  
  try {
    var data = JSON.parse(xhttp.responseText)  
  } catch(e) {
    console.error("failed to parse JSON")
    console.error(xhttp.responseText)
    throw(e)
  }
  
  var browserList = document.getElementById('browser-list')
  browserList.innerHTML = ''
  for(var i=0;i<data.length;i++) {
    if(data[i].type.toLowerCase() === 'file') {
      browserList.innerHTML += '<li class="browser-element"><a class="file" target="_blank" href="' + data[i]._links.html + '"><div class="icon">&#x1f517;</div>' + data[i].name + "</a></li>"
    }

    if(data[i].type.toLowerCase() === 'dir') {
      browserList.innerHTML += '<li class="browser-element"><button class="dir" id="' + data[i].name + '-btn"><div class="icon">&#x1f4c2;</div>' + data[i].name + '</button></li>'
      console.log("getting", data[i].name + '-btn')

      setTimeout(function(name){
        document.getElementById(name + '-btn').addEventListener('click', function() {
          browseNext(event, name)
        })
      }, 100, data[i].name)

    }
  }
}
