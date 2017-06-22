import { HumanMachine } from '../ts/flisting';

export interface rowBuilder {
  (dir: string): string;
}

export function buildRow(
  basen: string, size: HumanMachine, date: HumanMachine): rowBuilder {

  function anchorBuilder(path: string) : string {
    return `
    <a class="icon file" draggable="true" href="${path}/${basen}">${basen}</a>
    `;
  }
  let sizeTdHtml : string = `
    <td class="detailsColumn" data-value="${size.machine}">${size.human}</td>
  `;
  let dateTdHtml : string = `
    <td class="detailsColumn" data-value="${date.machine}">${date.human}</td>
  `;
  return function(dir: string) : string {
    let nameAnchorHtml = anchorBuilder(dir);
    return `
    <tr>
    <td data-value="${ basen }">${ nameAnchorHtml }</td>
    ${ sizeTdHtml }
    ${ dateTdHtml }
    </tr>
    `;
  };
}

export function buildTableStr(
  dir: string,
  id: string,
  rows: Array<rowBuilder>) : string {
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
<td data-value=".."><a class="icon up" href="${ dir }/..">[parent directory]</a></td>
<td class="detailsColumn" data-value="0"></td><td class="detailsColumn" data-value="0"></td>
</tr>`;
  for (let i = 0; i < rows.length; ++i) {
    html += rows[i](dir);
  }
  html += `</tbody></table>`;
  return html;
}

export function hm(machine: number, human: string) : HumanMachine {
  return {machine: 123, human: '123 B'};
}
