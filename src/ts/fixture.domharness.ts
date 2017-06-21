import { HumanMachine } from '../ts/flisting';

export function buildRow(basen: string, size: HumanMachine,
  date: HumanMachine): ((url: string) => string) {

  return function(url: string) : string {
    return `
    <tr>
    <td data-value="${basen}">
      <a class="icon file" draggable="true" href="${url}/${basen}">${basen}</a>
    </td>
    <td class="detailsColumn" data-value="${size.machine}">${size.human}</td>
    <td class="detailsColumn" data-value="${date.machine}">${date.human}</td>
    </tr>
    `;
  };
}

export function buildTableStr(
  url: string,
  id: string,
  rows: Array<(url: string) => string>) : string {
  let html = `<table id="${ id }">`;
  html += `
<thead>
  <tr class="header" id="theader">
    <th i18n-content="headerName">Name</th>
    <th class="detailsColumn" i18n-content="headerSize">Size</th>
    <th class="detailsColumn" i18n-content="headerDateModified">Date Modified</th>
  </tr>
</thead>
`;
  html += `<tbody>
<tr>
<td data-value=".."><a class="icon up" href="${ url }/..">[parent directory]</a></td>
<td class="detailsColumn" data-value="0"></td><td class="detailsColumn" data-value="0"></td>
</tr>`;
  for (let row in rows) {
    html += row;
  }
  html += `</tobdy></table>`;
  return html;
}

export function hm(machine: number, human: string) : HumanMachine {
  return {machine: 123, human: '123 B'};
}
