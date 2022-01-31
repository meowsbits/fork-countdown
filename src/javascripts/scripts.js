// Load jQuery from NPM
import $ from 'jquery';
import moment from 'moment';

window.jQuery = $;
window.$ = $;

const blockTimeEstimateSeconds = 13.5;
const forkBlockN = 14525000;

const intervalPollms = 14 * 1000;
const intervalUIms = 1000;

let currentBlockNumber = 14445075;
currentBlockNumber = 14445076;
let updatedAt = 0;

$('#blockTimeEstimateSeconds').val(blockTimeEstimateSeconds);

function calculateTimeDifference(fork, current, secondsPerBlock) {
  return (fork - current) * secondsPerBlock;
}

function updateUI() {
  const forkAt = moment().add(calculateTimeDifference(forkBlockN, currentBlockNumber, $('#blockTimeEstimateSeconds').val()), 's');

  $('#forkBlock').text(`${forkBlockN}`);
  $('#forkBlockDiffCurrent').text(`${forkBlockN - currentBlockNumber}`);
  $('.currentBlockNumber').text(`${currentBlockNumber}`);
  $('#currentBlockNumber-link').attr('href', `https://blockscout.com/etc/mainnet/block/${currentBlockNumber}/transactions`);
  $('#forkAt').text(`${forkAt.fromNow()}`);
  $('#forkAtHuman').text(`${forkAt.format('LLLL')}`);
  $('#updatedAt').text(`${moment().diff(moment(updatedAt), 'seconds')} seconds ago`);
  $('#nextUpdateAt').text(`in ${moment(updatedAt).add(intervalPollms).diff(moment(), 's')} seconds`);
}

function pollUpdate() {
  const d = {
    method: 'eth_blockNumber',
    jsonrpc: '2.0',
    params: [],
    id: Date.now(),
  };

  function handleSuccess(response) {
    console.log('success', response);
    const newCurrentBlockNumber = parseInt(response.result.substring(2), 16);

    if (newCurrentBlockNumber > currentBlockNumber) {
      const elOriginalColors = [];
      $('.glow-on-update').each((i, el) => {
        elOriginalColors.push($(el).css('color'));
        $(el).css('color', 'limegreen');
      });
      setTimeout(() => {
        $('.glow-on-update').each((i, el) => {
          $(el).css('color', elOriginalColors[i]);
        });
      }, 500);
    }
    currentBlockNumber = newCurrentBlockNumber;
    updatedAt = Date.now();

    updateUI();
  }

  function handleError(xhr, status) {
    console.error('status', status, 'xhr', xhr);
  }

  $.ajax({
    url: 'https://classic.rpc.etccore.in',
    type: 'POST',
    crossDomain: true,
    data: JSON.stringify(d),
    dataType: 'json',
    contentType: 'application/json',
    success: handleSuccess,
    error: handleError,
  });
}

updateUI();
setInterval(updateUI, intervalUIms);

pollUpdate();
setInterval(pollUpdate, intervalPollms);
