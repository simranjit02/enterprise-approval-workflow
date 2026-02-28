console.log('FILE LOADED')
module.exports = (srv) => {
  console.log('SERVICE FILE LOADED')

  srv.on('submit', 'Requests', async (req) => {
    console.log('req',req)
  })
}