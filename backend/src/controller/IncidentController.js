const connection = require('../database/connection')

module.exports = {

    async index(request, respose) {
        const { page = 1 } = request.query;
        const [count] = await connection('incidents').count();
        console.log(count)
        const ongs = await connection('incidents')
            .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
            .limit(5)
            .offset((page - 1) * 5)
            .select([
                'incidents.*',
                'ongs.name',
                'ongs.whatsapp',
                'ongs.city', 'ongs.uf'
            ]);

        respose.header('x-total-count', count['count(*)'])
        return respose.json(ongs);
    },
    async create(request, response) {

        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id
        })

        return response.json({ id })
    },
    async delete(request, response) {

        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incidents = await connection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if (incidents.ong_id != ong_id) {
            return response.status(401).json({ error: "nao autorizado" })
        }
        await connection('incidents').where('id', id).delete();
        return response.status(204).send();
    }
}