const { throws } = require('assert');
const Koa = require('koa');
const koaBody = require('koa-body').default;

const app = new Koa();
app.use(koaBody());

function getCurrentDateTime() {
  const currentdate = new Date();
  const datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

  return datetime;
}

class Tickets {
  constructor() {
    this.tickets = [];
    this.command = undefined;
  }

  addTicket(id, name, description, status, created) {
    this.tickets.push({
      'id': id,
      'name': name,
      'description': description,
      'status': status,
      'created': created,
    });
  }

  redoTicket(id, name, description, status) {
    const redoTicked = this.tickets.find(item => item.id == id);

    redoTicked.name = name;
    redoTicked.description = description;
    redoTicked.status = status;
  }

  deleteTicket(id) {
    const redoTickedIndex = this.tickets.findIndex(item => item.id == id);
    this.tickets.splice(redoTickedIndex, 1);
  }

  getNewID() {
    let max = 0;
    for (const ticket of this.tickets) {
      if (ticket.id > max) {
        max = ticket.id;
      }
    }

    return max + 1;
  }
}

const tickets = new Tickets();
tickets.addTicket(1, 'get over here', 'Очень много подробного текста', false, getCurrentDateTime());
tickets.addTicket(2, '2222222', '2222222222222222222222222222', true, getCurrentDateTime());

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

app.use(async ctx => {
  let method = ctx.request.query.method;
  let data = '';

  if (method === undefined) {
    data = JSON.parse(ctx.request.body);
    method = data.method;
    data = data.data;
  }

  switch (method) {
    case 'allTickets':
      ctx.response.body = { 'comand': 'allTickets', 'data': tickets.tickets };
      return;
    case 'updateTicket':
      tickets.redoTicket(data.id, data.name, data.description, data.status);
      return;
    case 'deleteTicket':
      tickets.deleteTicket(ctx.request.query.id);
      return;
    case 'addTicket':
      tickets.addTicket(tickets.getNewID(), data.name, data.description, false, getCurrentDateTime());
    default:
      ctx.response.status = 404;
      return;
  }
});

app.listen(7070);

