console.log('FILE LOADED')
module.exports = (srv) => {
  console.log('SERVICE FILE LOADED')
 srv.before('CREATE', 'Requests', async (req) => {

      console.log(req.data);
      console.log(req.event);
  });
//   srv.before('*', async (req) => {
//   console.log('EVENT:', req.event)
//   console.log('TARGET:', req.target.name)
//   console.log('DATA:', req.data)
//   console.log('----------------------------------')
// })
}