import { RankingRecord } from "../model/RankingRecord";
import { save } from '@tauri-apps/plugin-dialog';
import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';

export class ExportService {

    async exportAsHtml(fileName: string, data: RankingRecord[]) {
        const json = JSON.stringify(data);
        const html = this.buildHtml(json);

        const filePath = await save({
            filters: [{ name: "HTML", extensions: ["html"] }],
            defaultPath: fileName,
        });

        if (!filePath) return;

        await writeTextFile(filePath, html, {
            baseDir: BaseDirectory.AppConfig,
        });
    }

    private buildHtml(jsonData: string): string {
        return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Mönsheim Tennis-Action Statistik</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: #f9f9f9;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }
    th, td {
      border: 1px solid #eee;
      padding: 10px;
      text-align: left;
      white-space: nowrap;
    }
    th {
      background: #f2f2f2;
    }
    button {
      padding: 6px 10px;
      background: #0078d7;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background: #005fa3;
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .modal h2 {
      margin-top: 0;
    }
    .close-btn {
      float: right;
      font-size: 1.2rem;
      cursor: pointer;
      color: #666;
    }
    .close-btn:hover {
      color: #000;
    }
    .ergebnis {
      margin: 1rem 0;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fafafa;
    }
    .ergebnis b {
      display: block;
      margin-bottom: 4px;
    }
    .match {
      margin-left: 1rem;
      padding: 3px 0;
    }
    .score {
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .win {
      background: #b6ffb3;
      color: #064d06;
    }
    .loss {
      background: #ffb3b3;
      color: #600;
    }
    .neutral {
      background: #fff3b0;
      color: #5a4b00;
    }
    .opponent {
      background: #e0e0e0;
      color: #333;
    }
  </style>
</head>
<body>
  <h1>Tennis-Action Rangliste</h1>
  <table id="statsTable">
    <thead>
      <tr>
        <th>Platz</th>
        <th>Name</th>
        <th>Punkte</th>
        <th>Spiele (S/N)</th>
        <th>Spieltage</th>
        <th>Ergebnisse</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <div class="modal-overlay" id="modalOverlay">
    <div class="modal">
      <span class="close-btn" onclick="closeModal()">&times;</span>
      <h2 id="modalTitle">Ergebnisse</h2>
      <div id="modalContent"></div>
    </div>
  </div>

  <script>
    var DATA = ${jsonData};

    function asBool(v) {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return v.toLowerCase() === "true";
      return !!v;
    }

    function getResultClass(my, opp) {
      if (my > opp) return "win";
      if (my < opp) return "loss";
      return "neutral";
    }

    function openModal(player) {
      document.getElementById("modalTitle").innerText = player.name + " \\u2013 Ergebnisse";
      var modalContent = document.getElementById("modalContent");

      modalContent.innerHTML = (player.details?.MatchDays ?? []).map(function(md) {
        return '<div class="ergebnis">' +
          '<b>' + new Date(md.matchDayDate).toLocaleDateString('de-DE') + '</b>' +
          '<div class="match">' +
          (md.matches ?? []).map(function(m) {
            var isHome = asBool(m.isPlayerHome);
            var my = isHome ? m.homeGames : m.guestGames;
            var opp = isHome ? m.guestGames : m.homeGames;
            var myCls = getResultClass(my, opp);
            return '<span class="score ' + myCls + '">' + my + '</span> - <span class="score opponent">' + opp + '</span>';
          }).join(" | ") +
          '</div></div>';
      }).join("");

      document.getElementById("modalOverlay").style.display = "flex";
    }

    function closeModal() {
      document.getElementById("modalOverlay").style.display = "none";
    }

    (function() {
      var tbody = document.querySelector("#statsTable tbody");
      DATA.forEach(function(player) {
        var wins = 0, losses = 0, gamesCount = 0;

        (player.details?.MatchDays ?? []).forEach(function(md) {
          (md.matches ?? []).forEach(function(m) {
            gamesCount++;
            var isHome = asBool(m.isPlayerHome);
            var ps = isHome ? m.homeGames : m.guestGames;
            var os = isHome ? m.guestGames : m.homeGames;
            if (ps > os) wins++;
            else if (ps < os) losses++;
          });
        });

        var matchdayCount = player.details?.MatchDays?.length ?? 0;

        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td>' + player.position + '</td>' +
          '<td>' + player.name + '</td>' +
          '<td>' + player.totalPoints + '</td>' +
          '<td>' + gamesCount + ' (' + wins + '/' + losses + ')</td>' +
          '<td>' + matchdayCount + '</td>' +
          '<td></td>';

        var btnCell = tr.lastElementChild;
        var btn = document.createElement("button");
        btn.textContent = "Anzeigen";
        btn.addEventListener("click", (function(p) { return function() { openModal(p); }; })(player));
        btnCell.appendChild(btn);

        tbody.appendChild(tr);
      });
    })();
  </script>
</body>
</html>`;
    }

}