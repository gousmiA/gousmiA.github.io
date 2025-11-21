<script>
function showReportage() {
  const panel1 = document.getElementById("panel-reportage");
  const panel2 = document.getElementById("panel-these");

  panel2.classList.remove("active");
  panel1.classList.add("active");

  panel2.classList.remove("enter-left");
  panel1.classList.remove("exit-right");
}

function showThese() {
  const panel1 = document.getElementById("panel-reportage");
  const panel2 = document.getElementById("panel-these");

  // panel 1 sort à droite
  panel1.classList.add("exit-right");

  // panel 2 arrive par la gauche
  panel2.classList.add("enter-left");
  panel2.classList.add("active");
}
</script>
